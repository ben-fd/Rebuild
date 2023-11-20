import {CartForm, Image, Money} from '@shopify/hydrogen';
import {Link, Await} from '@remix-run/react';
import {Suspense, useState, useEffect} from 'react';
import {useVariantUrl} from '~/utils';
import {CloseIcon, AddIcon, MinusIcon, Icons, VanIcon} from '~/components/Icons';
import {fieldDoctorSettings} from '~/root';

/**
 * @param {CartMainProps}
 */

const iconSize = "1.5em";
export function CartMain({layout, cart}) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart.discountCodes.filter((code) => code.applicable).length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </div>
  );
}

/**
 * @param {CartMainProps}
 */
function CartDetails({layout, cart}) {
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  return (
    <div className="cart-details">
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * @param {{
 *   layout: CartMainProps['layout'];
 *   lines: CartApiQueryFragment['lines'] | undefined;
 * }}
 */
export function CartLines({lines, layout}) {
  if (!lines) return null;

  return (
    <div aria-labelledby="cart-lines" className="">
      <ul>
        {lines.nodes.map((line) => (
          <CartLineItem key={layout + line.id} line={line} layout={layout} />
        ))}
      </ul>
    </div>
  );
}

const processProductTitle = (title) => {
  return title.replaceAll(' (Mediterranean)', "").replaceAll(' (Low FODMAP)', "").replaceAll("L+L ", "")
};
/**
 * @param {{
 *   layout: CartMainProps['layout'];
 *   line: CartLine;
 * }}
 */
function CartLineItem({layout, line}) {
  
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  //console.log(JSON.stringify(merchandise, null, 2))
  return (
    <li key={layout+id} className="grid  grid-cols-3 border-b gap-2 py-8 m-0">
      {image && (
        <figure className=" col-span-1 grow"><Image
        alt={title}
        aspectRatio="1/1"
        data={image}
        height={200}
        loading="lazy"
        width={200}
        className=" object-cover border border-gray-200 rounded-box shadow-sm w-full"
      /></figure>
      )}
      <div className="col-span-2 flex flex-col grow">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          className=" text-lg lowercase"
          onClick={() => {
            if (layout === 'aside') {
              // close the drawer
              window.location.href = lineItemUrl;
            }
          }}
        >{processProductTitle(product.title)}
        </Link>
        {/*<CartLinePrice line={line} as="span" />*/}
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small className="lowercase">
                {option.value}
              </small>
            </li>
          ))}

        </ul>
        <CartLineQuantity line={line}/>
      </div>
    </li>
  );
}

/**
 * @param {{checkoutUrl: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

/**
 * @param {{
 *   children?: React.ReactNode;
 *   cost: CartApiQueryFragment['cost'];
 *   layout: CartMainProps['layout'];
 * }}
 */
/*
export function CartSummary({cost, layout, children = null}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Totals</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {cost?.subtotalAmount?.amount ? (
            <Money data={cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      {children}
    </div>
  );
}
*/

/**
 * @param {{lineIds: string[]}}
 */
function CartLineRemoveButton({lineIds}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button type="submit"><CloseIcon size={iconSize} /></button>
    </CartForm>
  );
}

/**
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="card-actions flex-row justify-end">
      <div className="join w-sm">
        <div className="btn btn-sm join-item btn-circle bg-neutral">
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 0}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <span><MinusIcon size={iconSize}/></span>
            </button>
          </CartLineUpdateButton>
        </div>
        <input type="text" defaultValue={quantity} className="input input-bordered join-item bg-white text-center w-10 input-sm"/>
        <div className="btn btn-sm join-item btn-circle bg-neutral">
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
            >
              <span><AddIcon size={iconSize}/></span>
            </button>
          </CartLineUpdateButton>
        </div>
      </div>
      {/*<div className="btn btn-sm btn-circle bg-transparent">
        <CartLineRemoveButton lineIds={[lineId]} />
  </div>*/}
      
    </div>
  );
}

/**
 * @param {{
 *   line: CartLine;
 *   priceType?: 'regular' | 'compareAt';
 *   [key: string]: any;
 * }}
 */
function CartLinePrice({line, priceType = 'regular', ...passthroughProps}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return (
    <div>
      <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
export function CartEmpty({hidden = false, layout = 'aside'}) {
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link
        to="/collections"
        onClick={() => {
          if (layout === 'aside') {
            window.location.href = '/collections';
          }
        }}
      >
        Continue shopping →
      </Link>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes: CartApiQueryFragment['discountCodes'];
 * }}
 */
export function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="form-control w-full">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length} className="">
        <div>
          <UpdateDiscountForm>
            <div className="flex gap-2">
              <button className="btn btn-sm badge-accent">{codes?.join(', ')} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      {!codes.length && (<UpdateDiscountForm discountCodes={codes}>
        <div className="join w-full">
          <input type="text" name="discountCode" placeholder="discount code or gift card" className="input input-bordered input-secondary w-full join-item bg-white" />
          <button type="submit" className="btn join-item">Apply</button>
        </div>
      </UpdateDiscountForm>)}
      
    </div>
  );
}


export function CartMainPane({count, cart, deliveryInfo, layout, children}) {
  return (
        <div className="card card-compact bg-white shadow-2xl gap-4 z-30 sticky top-8 bottom-8">
          <div className="card-body justify-between h-[calc(100vh-64px)]">
              <h2 className="text-xl">your order</h2>
              <div className="grow overflow-y-scroll">
                {children}
              </div>
              <div className="flex flex-col gap-4">
                <div className="font-bold text-lg">{count} items</div>
                {<CartDeliveryDate deliveryInfo={deliveryInfo}></CartDeliveryDate>}
                <CartDiscounts discountCodes={cart?.discountCodes} />
                <CartSummary cart={cart} />
                <CartProgressBar cart={cart}/>
              </div>
            </div>
        </div>
 );
}

export function DesktopCartAside({cart, deliveryInfo}) {
  return (
    <div className="hidden lg:block col-span-2">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMainPane layout={"desktop"} count={cart?.totalQuantity} cart={cart} deliveryInfo={deliveryInfo}><CartLines lines={cart?.lines} layout={"desktop"}/></CartMainPane>;
          }}
        </Await>
      </Suspense>
    
    </div>
  )
}

export function CartProgressBar({cart, deliveryInfo}) {
const progress = Number(cart?.cost?.subtotalAmount?.amount).toFixed(0) || 0;
  
return ( progress < fieldDoctorSettings.minimumOrder ? <progress className="progress progress-accent h-4" value={progress} max="42.50"></progress> : <div className="card-actions">
   <Link to="/cart" className="btn btn-primary btn-block">continue</Link>
 </div>
)
    
}


function CartSummary({cart}) {
  const discountCost = Number(cart?.cost?.totalAmount?.amount) - Number(cart?.cost?.subtotalAmount?.amount);
  const discountAmount = { amount: String(discountCost), currencyCode: cart?.cost?.totalAmount?.currencyCode };
  const shipping = "free";
 
  return (
    <div className="card bg-white">
      <div className="card-body">
        <div className="flex flex-col gap-3">
          {cart?.cost?.subtotalAmount?.amount && <SummaryRow size={"sm"} label={"subtotal"}><Money data={cart?.cost?.subtotalAmount}></Money></SummaryRow>}
          {discountCost < 0 && <SummaryRow size={"sm"} label={"discount"}><Money className=" text-red-600" data={discountAmount}></Money></SummaryRow>}
          {shipping && <SummaryRow size={"sm"} label={"shipping"}>{shipping}</SummaryRow>}
          {cart?.cost?.totalAmount?.amount && <SummaryRow size={"lg"} label={"total"}><Money data={cart?.cost?.totalAmount}></Money></SummaryRow>}
        </div>
      </div>
    </div>
  )
}

function ukDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CartDeliveryDate({deliveryInfo}){

  return (
   <Suspense fallback={<p>loading...</p>}>
   <Await resolve={deliveryInfo}>
     {(deliveryInfo)=> {
        const selectedDate = deliveryInfo?.delivery_date;
        return <SummaryRow size={"lg"} label={<span className="flex flex-row gap-4"><VanIcon size={"1.5em"}/> <>{ukDate(new Date(selectedDate))}</></span>}><button className="btn btn-secondary">change</button></SummaryRow>}
     }
   </Await>
 </Suspense>
  )
  /*
  return (
    <div className="card bg-white">
      <div className="card-body">
        <h4 className="card-title">your plan</h4>
        <label className="label">
          <span className="label-text">first delivery date</span>
        </label>
          <select className="select select-bordered select-secondary w-full max-w-xs bg-white">
            <Suspense fallback={<p>loading...</p>}>
              <Await resolve={deliveryInfo}>
                {(deliveryInfo)=> {
                    return deliveryInfo?.delivery_dates.map((date) => (<option key={date} value={date}>{ ukDate(new Date(date)) }</option>))}
                }
              </Await>
            </Suspense>
          </select>
          
          <label className="label">
          <span className="label-text">delivery frequency</span>
        </label>
        <select className="select select-bordered select-secondary w-full max-w-xs bg-white">
          <option>every week</option>
          <option>every 2 weeks</option>
          <option>every 3 weeks</option>
          <option>every 4 weeks</option>
          <option>one off</option>
        </select>

        </div>
        
      </div>
  )
  */
}

function SummaryRow({label, value, size, children}) {
  const sizeClass = "text-" + size;
  return (
    <div className="flex justify-between align-middle  items-center">
      <dt className={sizeClass}>{label}</dt>
      <dd className={sizeClass}>{children}</dd>
    </div>
  );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {CartApiQueryFragment['lines']['nodes'][0]} CartLine */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: 'page' | 'aside';
 * }} CartMainProps
 */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
