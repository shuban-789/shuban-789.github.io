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

## Datatypes and Variables
