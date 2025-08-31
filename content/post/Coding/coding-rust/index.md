---
title: "I finally learned Rust"
description: "This lang is actually kinda goated"
slug: "coding-rust"
date: "2025-08-07 00:00:00+0000"
image: "cover.png"
categories:
    - "Coding"
tags: 
weight: 1
---

## Introduction

As someone who writes code primarily in Go and Python, maybe sometimes C and Java, I have never had a cult following for a language. I liked Go for its syntax, compiler, and extensive libraries and import system and Python for its simple syntax and basically the ability for it to act as both as a programming and scripting language. Everytime I learn a new language its with a certain goal in mind which is achieved by learning that language. Go for server-side apps and command line tools, Python for scientific computing and scripts

The main reason I don't code in C or Java too often is because aside from FTC, I don't really see a use in writing Java code now that AP CSA is over. As for C, I don't trust myself to write safe code. 

Learning Rust was the first time I learned a language just to learn it because out of any programming language out there, Rust probably has one of the largest cults. I wanted to see what the hype was all about.

I started where I think everyone starts learning Rust: https://doc.rust-lang.org/book/

This yap session might be like a mini version of this book

## Cargo and Rustc

The binary `rustc` was the main compiler for rust programs. The convention was pretty easy to follow. `rustc main.rs` and you would get a `main` ELF file. If you want to compile a standalone Rust program that would be done with `rustc`. You may think this is a Pretty standard compiler, but I actually really like `rustc` as a compiler because of its error messages. Whenever an error is present inside of a Rust program, not onlly is `rustc` able to capture it, but it gives pretty accurate and helpful suggestions for fixes which is especially useful when dealing with datatype compliance. A breath of fresh air compared to the horrendous `gcc` error wall.

A lot of `rustc` functionality is also invoked by `cargo` which is the package manager. A project is likely best formatted to work with `cargo` if it has many dependencies which require fetching or resolving. The main file to write is `Cargo.toml` which stores information for your program, but also important compilation options such as whether you want to compile it to a library or a standard executable. Overall its pretty great for handling dependencies and managing your project. 


`cargo new project` creates a new cargo project directory

`Cargo.toml`
```
[package]
name = "project"
version = "0.1.0"
edition = "2024"

[dependencies]
```

Build to executable: `cargo build`
Run program: `cargo run`
Check if it compiles: `cargo check`

Very good stuff. `9/10`

## Syntax: Datatypes and Variables

I am going to be very honest here syntax is probably a big part of what makes me like a programming language. More than speed or compiler and what not. I literally do not care if your language is "blazing fast". It can have a compiler which only works online and sends the source code to some server running off 5 lemon batteries in a rural Japanese village which then sends back the executable. If it has good syntax, then I like it.

Ironically the syntax I hate the most is JavaScript which is why I have always refused to learn it. It just looks like a toy language. Maybe because it kinda is.

I really like C and Go type syntax. Python syntax is also cool cuz Python is cool but not gonna lie I would have liked python more if I could use braces instead of indents.

ANYWAY! Rust var declaration. In Rust the simple datatypes are:

```
i8 --> 8 bit int
i16 --> 16 bit int (short)
i32 --> 32 bit int (int)
i64 --> 54 bit int (long)

f8 --> does not exist lol
f16 --> also does not exist lol
f32 --> 32 bit float
f64 --> 64 bit float

u8 --> unsigned 8 bit int
u16 --> unsigned 16 bit int
u32 --> unsigned 32 bit int
u64 --> unsigned 64 bit int

bool --> Pretty new and underground primitive. Revolutionary too. Stores "true" or "false". 
char --> single unicode scalar value
```

I think you see a pattern here. Rust is very slang when it comes to its datatypes which I think is pretty tuff. Like they way it calls stuff i64 and f32 is just kinda tuff right off the bat. Already some consistency here.

Rust also has type inference. So you can do stuff like this:

```rust
fn ret_one() -> i32 {
    let n = 1;
    return n;
}
```

and it will automatically treat 1 as an `i32`.