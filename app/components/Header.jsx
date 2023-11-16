import {Await, NavLink} from '@remix-run/react';
import {Suspense} from 'react';
import {useRootLoaderData} from '~/root';
import {Image, Money} from '@shopify/hydrogen';
import {CartMain, CartDiscounts, CartLines} from '~/components/Cart';
import {Link} from '@remix-run/react';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart}) {
  const {shop, menu} = header;
  console.log(JSON.stringify(shop, null, 2))
  return (
    <nav className="bg-secondary shadow-xl navbar sticky top-0 md:px-4">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <HeaderMenu 
            menu={menu}
            viewport={'mobile'}
            primaryDomainUrl={header.shop.primaryDomain.url}
          />
        </div>
        <NavLink prefetch="intent" to="/" style={activeLinkStyle} className="image-full" end>
          <Image data={shop.brand.logo.image} sizes="120px"/>
        </NavLink>
      </div>
       
      

      <div className="navbar-center">
        <div className="hidden lg:flex">
          <HeaderMenu 
              menu={menu}
              viewport={'desktop'}
              primaryDomainUrl={header.shop.primaryDomain.url}
            />
        </div>
      </div>
      
      <div className="navbar-end hidden lg:flex">
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </nav>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 * }}
 */
export function HeaderMenu({menu, primaryDomainUrl, viewport}) {
  const {publicStoreDomain} = useRootLoaderData();

  function closeAside(event) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  const navClass = viewport == 'mobile' ? "menu menu-sm dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52" : "menu menu-horizontal px-1";

  return (
      <ul tabIndex={0} className={navClass}>
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        const hasSubmenu = item.items.length > 0;
        // if the url is internal, we strip the domain
        const url = stripURLDomain(item, publicStoreDomain, primaryDomainUrl);
          
        return !hasSubmenu ? (<li key={viewport + item.id + "single"}>
          <NavLink
          end
          onClick={closeAside}
          style={activeLinkStyle}
          to={url}
          className="lowercase"
        >
          {item.title}
        </NavLink>
        </li>) : (<li key={viewport + item.id + "parent"}>
          <details>
          <summary>
            <NavLink
            end
            onClick={closeAside}
            style={activeLinkStyle}
            to={url}
            className="lowercase"
          >
            {item.title}
          </NavLink>
          </summary>
          <ul className="p-2 bg-base-100  shadow-xl">
            {item.items.map((subitem) => {
              const subItemUrl = stripURLDomain(subitem, publicStoreDomain, primaryDomainUrl);
              return (<li key={viewport + subitem.id + "child"}><NavLink
                end
                onClick={closeAside}
                style={activeLinkStyle}
                to={subItemUrl}
                className="lowercase"
              >
                {subitem.title}
              </NavLink></li>)
            })}
            
          </ul>
        </details>
        </li>)
      })}
      </ul>
  );
}

function stripURLDomain(item, publicStoreDomain, primaryDomainUrl){
  return item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <NavLink className="lowercase" prefetch="intent" to="/account" style={activeLinkStyle}>
        {isLoggedIn ? 'Account' : 'Sign in'}
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function SearchToggle() {
  return <a href="#search-aside">Search</a>;
}

/**
 * @param {{count: number}}
 */
function CartHeader({count, cart}) {
  
  return (
  <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <div className="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="badge badge-sm indicator-item">{count}</span>
        </div>
      </label>

      <div tabIndex={0} className="w-70 mt-3 z-30 card card-compact bg-base-100 dropdown-content shadow w-[30em]">
        <div className="card-body gap-4 z-30">
          <div className="font-bold text-lg">{count} items</div>
          <CartLines lines={cart?.lines} layout={"aside"}/>
          <CartDiscounts discountCodes={cart?.discountCodes} />

          <CartSummary cart={cart} />
          
          <div className="card-actions">
            <Link to="/cart" className="btn btn-primary btn-block">continue</Link>
          </div>
        </div>
      </div>
    </div>
 );
}

function CartSummary({cart}) {
  const discountCost = Number(cart?.cost?.totalAmount?.amount) - Number(cart?.cost?.subtotalAmount?.amount);
  const discountAmount = { amount: String(discountCost), currencyCode: cart?.cost?.totalAmount?.currencyCode };
  const shipping = "free";
  console.log(discountAmount)
 
  return (
    <div className="card bg-white">
      <div className="card-body">
        <div className="flex flex-col gap-3">
          {cart?.cost?.subtotalAmount?.amount && <SummaryRow size={"sm"} label={"subtotal"}><Money data={cart?.cost?.subtotalAmount}></Money></SummaryRow>}
          {discountCost > 0 && <SummaryRow size={"sm"} label={"discount"}><Money data={discountAmount}></Money></SummaryRow>}
          {shipping && <SummaryRow size={"sm"} label={"shipping"}>{shipping}</SummaryRow>}
          {cart?.cost?.totalAmount?.amount && <SummaryRow size={"lg"} label={"total"}><Money data={cart?.cost?.totalAmount}></Money></SummaryRow>}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({label, value, size, children}) {
  const sizeClass = "text-" + size;
  return (
    <div className="flex justify-between">
      <dt className={sizeClass}>{label}</dt>
      <dd className={sizeClass}>{children}</dd>
    </div>
  );
}
/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartHeader count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartHeader count={0} />;
          return <CartHeader count={cart.totalQuantity || 0} cart={cart}/>;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>} HeaderProps */
/** @typedef {'desktop' | 'mobile'} Viewport */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('./Layout').LayoutProps} LayoutProps */
