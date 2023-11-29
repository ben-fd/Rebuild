import {Await} from '@remix-run/react';
import {Suspense, useState, useEffect} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain, DesktopCartAside, CartModals} from '~/components/Cart';
import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';
import {TickIcon} from './Icons';
import {fieldDoctorSettings} from '~/root';

/**
 * @param {LayoutProps}
 */
export function Layout({
  cart,
  deliveryInfo,
  children = null,
  footer,
  header,
  isLoggedIn,
}) {
  return (
    <>
      {/*<SearchAside />*/}
      <CartModals cart={cart} deliveryInfo={deliveryInfo} />
      <Header
        header={header}
        cart={cart}
        deliveryInfo={deliveryInfo}
        isLoggedIn={isLoggedIn}
      />

      {/*
      <section className="flex justify-center py-0">
        <div className="lg:grid lg:grid-cols-4">
          <main className="lg:col-span-3">{children}</main>
          <DesktopCartAside cart={cart} deliveryInfo={deliveryInfo} />
        </div>
      </section>
      */}
      <section className="flex justify-center py-0">
        <div className="lg:grid lg:grid-cols-4">
          <main className="w-screen lg:col-span-4">{children}</main>
        </div>
      </section>

      <Suspense>
        <Await resolve={footer}>
          {/*(footer) => <Footer menu={footer.menu} shop={header.shop} />*/}
        </Await>
      </Suspense>
    </>
  );
}

export function setNotification(type, message) {
  document.getElementById('notificationContainer').innerHTML = userNotification(
    type,
    message,
  );
  setTimeout(() => {
    document.getElementById('notificationContainer').innerHTML = '';
  }, 3000);
}

/**
 * @param {{cart: LayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function userNotification(type, message) {
  switch (type) {
    case 'success':
      return `<div role="alert" class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 64 64" fill="none" stroke="#000000"><circle cx="32" cy="32" r="24"/><polyline points="44 24 28 40 20 32"/></svg>
                <span>${message}</span>
              </div>
            `;
      break;
    case 'error':
      break;
  }
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <PredictiveSearchForm>
          {({fetchResults, inputRef}) => (
            <div>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button type="submit">Search</button>
            </div>
          )}
        </PredictiveSearchForm>
        <PredictiveSearchResults />
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   menu: HeaderQuery['menu'];
 *   shop: HeaderQuery['shop'];
 * }}
 */
function MobileMenuAside({menu, shop}) {
  return (
    <Aside id="mobile-menu-aside" heading="MENU">
      <HeaderMenu
        menu={menu}
        viewport="mobile"
        primaryDomainUrl={shop.primaryDomain.url}
      />
    </Aside>
  );
}

/**
 * @typedef {{
 *   cart: Promise<CartApiQueryFragment | null>;
 *   children?: React.ReactNode;
 *   footer: Promise<FooterQuery>;
 *   header: HeaderQuery;
 *   isLoggedIn: boolean;
 * }} LayoutProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
