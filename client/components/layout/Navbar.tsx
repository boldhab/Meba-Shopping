import Link from "next/link";

export function Navbar() {
  return (
    <header className="site-header">
      <Link href="/">Meba Shopping</Link>
      <nav className="header-nav">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/account">Account</Link>
      </nav>
    </header>
  );
}
