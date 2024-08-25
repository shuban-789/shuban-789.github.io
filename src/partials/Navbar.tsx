import {
  Logo,
  NavbarTwoColumns,
  NavMenu,
  NavMenuItem,
  Section,
} from 'astro-boilerplate-components';

const Navbar = () => (
  <Section>
    <NavbarTwoColumns>
      <a href="/">
        <Logo
          icon={
            <img src="assets/images/linuxpng.png" alt="title" width="30" height="30"></img>
          }
          name="Shuban's Blog"
        />
      </a>

      <NavMenu>
        <NavMenuItem href="/posts/">Blogs</NavMenuItem>
        <NavMenuItem href="https://github.com/shuban-789">GitHub</NavMenuItem>
        <NavMenuItem href="https://ctftime.org/user/189279">CTFtime</NavMenuItem>
        <NavMenuItem href="https://leetcode.com/u/shuban-789/">Leetcode</NavMenuItem>
      </NavMenu>
    </NavbarTwoColumns>
  </Section>
);

export { Navbar };
