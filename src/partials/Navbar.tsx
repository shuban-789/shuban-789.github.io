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
        <span className="text-sky-500 text-xl font-bold">
          Shuban's Blog
        </span>
      </a>

      <NavMenu>
        <span className="text-sky-500 text-lg hover:underline">
          <NavMenuItem href="/posts/">Blogs</NavMenuItem>
        </span>
        <span className="text-sky-500 text-lg hover:underline">
          <NavMenuItem href="https://devpost.com/shuban-789">Devpost</NavMenuItem>
        </span>
        <span className="text-sky-500 text-lg hover:underline">
          <NavMenuItem href="https://ctftime.org/user/189279">CTFtime</NavMenuItem>
        </span>
        <span className="text-sky-500 text-lg hover:underline">
          <NavMenuItem href="https://leetcode.com/u/shuban-789/">Leetcode</NavMenuItem>
        </span>
      </NavMenu>
    </NavbarTwoColumns>
  </Section>
);

export { Navbar };
