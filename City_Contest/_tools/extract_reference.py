#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract reference.zip with correct GBK filename decoding and CRC verification."""
import os, sys, zipfile, zlib

SRC = "/bigdisk/lhg/road_rec/reference.zip"
DST = "/bigdisk/lhg/road_rec/reference"


def dec(name):
    # zip has no UTF-8 flag -> Python decoded bytes as cp437; real encoding is GBK
    try:
        s = name.encode("cp437").decode("gbk")
    except Exception:
        s = name
    # safety: strip any path traversal
    parts = [p for p in s.replace("\\", "/").split("/") if p not in ("", ".", "..")]
    return os.path.join(*parts) if parts else "unnamed"


def main():
    z = zipfile.ZipFile(SRC)
    infos = z.infolist()
    files = [i for i in infos if not i.is_dir()]
    dirs = [i for i in infos if i.is_dir()]
    print("archive: %d dirs, %d files, %.1f MB" % (
        len(dirs), len(files), sum(i.file_size for i in files) / 1048576))
    os.makedirs(DST, exist_ok=True)
    ok = bad = 0
    names = []
    for i, info in enumerate(files, 1):
        rel = dec(info.filename)
        out = os.path.join(DST, rel)
        if not os.path.abspath(out).startswith(os.path.abspath(DST) + os.sep):
            print("  SKIP (escapes dest):", rel)
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)
        crc = 0
        with z.open(info) as fh, open(out, "wb") as w:
            while True:
                b = fh.read(1 << 20)
                if not b:
                    break
                crc = zlib.crc32(b, crc)
                w.write(b)
        if crc & 0xFFFFFFFF != info.CRC:
            print("  CRC MISMATCH:", rel)
            bad += 1
        else:
            ok += 1
        names.append((rel, info.file_size))
        if i % 15 == 0:
            print("  ... %d/%d" % (i, len(files)), flush=True)
    print("\nextracted OK: %d, CRC failures: %d" % (ok, bad))
    with open(os.path.join(DST, "_FILELIST.txt"), "w", encoding="utf-8") as fh:
        for rel, sz in names:
            fh.write("%10d  %s\n" % (sz, rel))


if __name__ == "__main__":
    main()
