#!/usr/bin/env bash
# MinerU 包装：只读 /bigdisk 沙箱下工作
#  - MINERU_HOME 默认指向工作区（模型软链，仅 .locks 需可写）；可用 MINERU_HOME 覆盖
#  - cache/tmp 重定向到工作区；可用 TMPDIR 覆盖
#  - 默认使用 GPU（GPU_ID 默认 1，可覆盖）
set -euo pipefail
WS=/bigdisk/lhg/road_rec
M=/bigdisk/lhg/mineru
export MINERU_HOME="${MINERU_HOME:-$WS/.mineru/home}"
export MINERU_MODEL_SOURCE=modelscope
export MINERU_MODEL_SMALL_BACKEND=torch
export MODELSCOPE_CACHE="${MODELSCOPE_CACHE:-$WS/.mineru/cache/modelscope}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$WS/.mineru/cache}"
export HF_HOME="${HF_HOME:-$WS/.mineru/cache/huggingface}"
export HF_HUB_CACHE="${HF_HUB_CACHE:-$WS/.mineru/cache/huggingface/hub}"
export TORCH_HOME="${TORCH_HOME:-$WS/.mineru/cache/torch}"
export PIP_CACHE_DIR="${PIP_CACHE_DIR:-$WS/.mineru/cache/pip}"
export TMPDIR="${TMPDIR:-$WS/.mineru/tmp}"
export GPU_ID="${GPU_ID:-1}"
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-$GPU_ID}"
unset MINERU_MODEL_VLM_SERVER_URL || true
mkdir -p "$MODELSCOPE_CACHE" "$HF_HUB_CACHE" "$TORCH_HOME" "$TMPDIR" "$XDG_CACHE_HOME" "$MINERU_HOME"
exec "$M/venv/bin/python" "$M/mineru_cli.py" "$@"
