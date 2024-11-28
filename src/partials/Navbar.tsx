import {
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
          width="30"
          height="30"
          style={{ marginRight: '8px' }}
        />
        <span className="text-sky-500 text-2xl font-bold">
          Shuban's Blog
        </span>
      </a>

      <NavMenu>
        <span className="text-cyan-400 text-xl">
          <NavMenuItem href="/posts/">/blogs</NavMenuItem>
        </span>
        <span className="text-cyan-400 text-xl">
          <NavMenuItem href="https://devpost.com/shuban-789">/hackathons</NavMenuItem>
        </span>
        <span className="text-cyan-400 text-xl">
          <NavMenuItem href="https://ctftime.org/user/189279">/ctf</NavMenuItem>
        </span>
        <span className="text-cyan-400 text-xl">
          <NavMenuItem href="https://leetcode.com/u/shuban-789/">/leetcode</NavMenuItem>
        </span>
        <span className="text-cyan-400 text-xl">
          <NavMenuItem href="https://leetcode.com/u/shuban-789/">/competitions</NavMenuItem>
        </span>
      </NavMenu>
    </NavbarTwoColumns>
  </Section>
);

export { Navbar };
