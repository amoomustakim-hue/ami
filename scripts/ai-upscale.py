"""
AI-upscales the walkthrough frames with Real-ESRGAN (realesr-general-x4v3).

The source frames are 832 px wide and heavily JPEG-compressed (~32 KB each),
and the film is drawn edge to edge, so on a desktop screen it is enlarged
2-3x. Plain resampling can only enlarge the blocking; Real-ESRGAN is trained
on exactly this kind of damage and restores edges, glass and fabric instead.

    python3 -m venv .venv && .venv/bin/pip install torch numpy pillow
    curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
    .venv/bin/python scripts/ai-upscale.py realesr-general-x4v3.pth
    npm run frames       # builds the web ladders from frames-master/

Writes frames-master/NNNN.webp: watermark-cropped, upscaled 4x, then
resampled to 1664 px wide (2x the source). Runs on CPU, ~10 s per frame on
4 cores; frames already written are skipped, so an interrupted run resumes.
"""
import glob
import os
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'ezgif-7c37c7cc4726c02e-jpg')
OUT = os.path.join(ROOT, 'frames-master')
# Must match the crop in optimize-frames.mjs (source frames are 832 x 1120).
CROP_TOP, CROP_BOTTOM = 58, 84
MASTER_WIDTH = 1664


class SRVGGNetCompact(nn.Module):
    """realesr-general-x4v3: 32 conv + PReLU blocks, pixel-shuffle x4, nearest-neighbour residual."""

    def __init__(self, feat=64, convs=32, scale=4):
        super().__init__()
        self.scale = scale
        body = [nn.Conv2d(3, feat, 3, 1, 1), nn.PReLU(feat)]
        for _ in range(convs):
            body += [nn.Conv2d(feat, feat, 3, 1, 1), nn.PReLU(feat)]
        body += [nn.Conv2d(feat, 3 * scale * scale, 3, 1, 1)]
        self.body = nn.Sequential(*body)
        self.shuffle = nn.PixelShuffle(scale)

    def forward(self, x):
        return self.shuffle(self.body(x)) + F.interpolate(x, scale_factor=self.scale, mode='nearest')


def main(weights):
    os.makedirs(OUT, exist_ok=True)
    torch.set_num_threads(os.cpu_count())
    net = SRVGGNetCompact()
    state = torch.load(weights, map_location='cpu', weights_only=True)
    net.load_state_dict(state.get('params', state))
    net.eval()

    files = sorted(glob.glob(os.path.join(SRC, '*.jpg')))
    start, done = time.time(), 0
    with torch.inference_mode():
        for i, path in enumerate(files):
            target = os.path.join(OUT, f'{i + 1:04d}.webp')
            if os.path.exists(target):
                continue
            img = Image.open(path).convert('RGB')
            img = img.crop((0, CROP_TOP, img.width, img.height - CROP_BOTTOM))
            x = torch.from_numpy(np.array(img)).permute(2, 0, 1)[None].float() / 255
            y = net(x).clamp(0, 1)[0].permute(1, 2, 0).mul(255).round().byte().numpy()
            up = Image.fromarray(y)
            h = round(up.height * MASTER_WIDTH / up.width)
            up.resize((MASTER_WIDTH, h), Image.LANCZOS).save(target, quality=92, method=6)
            done += 1
            print(f'{i + 1}/{len(files)}  {(time.time() - start) / done:.1f}s/frame', flush=True)
    print(f'wrote {OUT}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
