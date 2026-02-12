---
title: "VNE Writeup"
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

> SUID, short for Set User ID, is a special permission that can be assigned to executable files. When an executable file has the SUID permission enabled, it allows users who execute the file to temporarily assume the privileges of the file's owner.

## Plan
Using the information we have gathered, we can try to assess vulnerabilities on the target system. So far, we have thought of environment variable injection so we can try to plan this out.

We make an ls binary that spawns a shell. Since the file has an SUID, this will give us a root shell if the binary we are manipulating uses ls (in which according to the hints, it does).

### The Plan in Practice 
When "ls" is typed into the command line, the system looks through path for an executable with the name "ls". So in the injected PATH, because `/tmp` is first, when the binary which runs ls as root runs "ls" as root it wil run the binary as root which will run /bin/bash root.

## Actually Doing Stuff
First, let's log onto the machine. To logon, we will need to use ssh with the command format of: 

`ssh -p <port> <user>@<ip>`

After logging on, we are able to edit the PATH. We can inject /tmp to the front to make sure it loks for binaries there

Finally, we need to make the fake ls binary containing this C code:

```c
#include <stdio.h>
#include <stdlib.h>

int main()
{
  system("/bin/bash");
}
```

then just run the bin and get flag. The SUID binary will invoke ls but will end up calling /tmp/ls because /tmp is the first item of PATH

