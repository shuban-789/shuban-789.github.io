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
            <svg
              className="mr-1 h-10 w-10 stroke-cyan-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <text x="10" y="40" font-family="Arial" font-size="20" fill="black">&gt;</text>
            </svg>
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
