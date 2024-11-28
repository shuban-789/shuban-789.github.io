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
      <a href="/" className="flex items-center">
        <img
          src="/assets/images/penguin.png"
          alt="title"
          width="26"
          height="26"
          style={{ marginRight: '8px' }}
        />
        <span className="text-sky-500 font-bold">
          Shuban's Blog
        </span>
      </a>

      <NavMenu>
        <NavMenuItem href="/posts/">Blogs</NavMenuItem>
        <NavMenuItem href="https://devpost.com/shuban-789">Devpost</NavMenuItem>
        <NavMenuItem href="https://ctftime.org/user/189279">CTFtime</NavMenuItem>
        <NavMenuItem href="https://leetcode.com/u/shuban-789/">Leetcode</NavMenuItem>
      </NavMenu>
    </NavbarTwoColumns>
  </Section>
);

export { Navbar };
