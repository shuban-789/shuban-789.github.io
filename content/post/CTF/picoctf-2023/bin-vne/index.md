---
title: "PicoCTF 2023 Binary Exploitation: VNE"
description: "Writeup for VNE from PicoCTF 2023"
slug: "picoctf-vne"
date: "2023-04-06 00:00:00+0000"
image: "cover.jpg"
categories:
    - "Pwn"
tags: 
weight: 1
---

## Initial Stuff

It is important to get familiar with the machine we log into so that we can find important assets such as possible vulnerabilities, which we may be able to exploit to get us root access.

### Important Details

* A binary that lists a directory as root
* Why this is important: It does it as root via an SUID bit, because the root user made the executable
* How it works: It takes the input for the directory as an environment variable
* Other important takeaways: If it is listing the contents of a directory, it is most probably doing something with the ls binary

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/5815e2a0-7aa3-4358-8976-26e145f19b36)

> SUID, short for Set User ID, is a special permission that can be assigned to executable files. When an executable file has the SUID permission enabled, it allows users who execute the file to temporarily assume the privileges of the file's owner.

## Plan
Using the information we have gathered, we can try to assess vulnerabilities on the target system. So far, we have thought of environment variable injection so we can try to plan this out.

We make an ls binary that spawns a shell. Since the file has an SUID, this will give us a root shell if the binary we are manipulating uses ls (in which according to the hints, it does).

### The Plan in Practice 
When "ls" is typed into the command line, the system looks through path for an executable with the name "ls". So in the injected PATH, because `/tmp` is first, when the binary which runs ls as root runs "ls" as root it wil run the binary as root which will run /bin/bash root.

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/9525b700-e39d-4ec6-a2b6-62fe0edec152)


## Actually Doing Stuff
First, let's log onto the machine. To logon, we will need to use ssh with the command format of: 

`ssh -p <port> <user>@<ip>`

After logging on, let’s list the environment variables, and try editing the PATH.

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/64a60cc6-9cad-4ccb-bd9d-c21473fb51ae)

It looks like the injection worked, so we can move on to making the fake ls executable.

Finally, we need to make the fake ls binary containing this C code:

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
  system("/bin/bash");
}
```

<br>

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/a7a36a0b-8473-4114-bd49-09561a07b049)

then just run the bin

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/984f1ed0-42e2-40c0-b297-5eb833df79e3)

