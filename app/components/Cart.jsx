import {CartForm, Image, Money} from '@shopify/hydrogen';
import {Link, Await, useFormAction, useSubmit} from '@remix-run/react';
import {Suspense, useState, useEffect, useRef} from 'react';
import {useVariantUrl} from '~/utils';
import {
  CloseIcon,
  AddIcon,
  MinusIcon,
  Icons,
  VanIcon,
  PencilIcon,
  FrequencyIcon,
} from '~/components/Icons';
import {fieldDoctorSettings} from '~/root';
import {setNotification} from './Layout';

/**
 * @param {CartMainProps}
 */

const iconSize = '1.5em';
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

export function processProductTitle(title) {
  return title
    .replaceAll(' (Mediterranean)', '')
    .replaceAll(' (Low FODMAP)', '')
    .replaceAll('L+L ', '');
}
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
    <li key={layout + id} className="grid  grid-cols-4 border-b gap-2 py-1 m-0">
      {image && (
        <figure className="col-span-1 grow">
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={120}
            loading="lazy"
            width={120}
            className=" object-cover border border-gray-300 rounded-box shadow-sm w-full"
          />
        </figure>
      )}
      <div className="col-span-3 flex flex-col grow">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          className=" text-lg lowercase  font-normal"
          onClick={() => {
            if (layout === 'aside') {
              // close the drawer
              window.location.href = lineItemUrl;
            }
          }}
        >
          {processProductTitle(product.title)}
        </Link>
        {/*<CartLinePrice line={line} as="span" />*/}
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small className="lowercase">{option.value}</small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} />
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
      <button type="submit">
        <CloseIcon size={iconSize} />
      </button>
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
              <span>
                <MinusIcon size={iconSize} />
              </span>
            </button>
          </CartLineUpdateButton>
        </div>
        <input
          type="text"
          defaultValue={quantity}
          className="input input-bordered join-item bg-white text-center w-10 input-sm"
        />
        <div className="btn btn-sm join-item btn-circle bg-neutral">
          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
            >
              <span>
                <AddIcon size={iconSize} />
              </span>
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
              <button className="btn btn-sm badge-accent">
                {codes?.join(', ')}{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-4 h-4 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      {!codes.length && (
        <UpdateDiscountForm discountCodes={codes}>
          <div className="indicator w-full">
            <span className="indicator-item indicator-top indicator-center badge badge-accent">
              discount code
            </span>
            <div className="join w-full">
              <input
                type="text"
                name="discountCode"
                placeholder="discount code or gift card"
                className="input input-bordered input-secondary w-full join-item bg-white"
              />
              <button
                type="submit"
                className="btn join-item btn-secondary font-light text-lg"
              >
                apply
              </button>
            </div>
          </div>
        </UpdateDiscountForm>
      )}
    </div>
  );
}

export function CartMainPane({count, cart, deliveryInfo, layout, children}) {
  return (
    <div className="shadow-2xl 2xl:shadow-none bg-white 2xl:bg-transparent  z-30 top-0 bottom-0  sticky h-screen  2xl:h-[calc(100vh-8px)]">
      <div className="bg-white card-compact gap-4">
        <div
          className={
            'card-body justify-between flex flex-col gap-4 h-[calc(100vh-8px)]'
          }
        >
          <h2 className="text-xl">your order</h2>
          <CartDeliverySettings
            cart={cart}
            deliveryInfo={deliveryInfo}
          ></CartDeliverySettings>
          <div className="grow overflow-y-scroll">{children}</div>
          <div className="flex flex-col gap-4">
            <div className="text-lg">{count} items</div>
            <CartDiscounts discountCodes={cart?.discountCodes} />
            <CartSummary cart={cart} />

            <CartProgressBar cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DesktopCartAside({cart, deliveryInfo}) {
  return (
    <aside className="hidden lg:block col-span-1 bg-white border border-l-gray-300 ">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return (
              <CartMainPane
                layout={'desktop'}
                count={cart?.totalQuantity}
                cart={cart}
                deliveryInfo={deliveryInfo}
              >
                <CartLines lines={cart?.lines} layout={'desktop'} />
              </CartMainPane>
            );
          }}
        </Await>
      </Suspense>
    </aside>
  );
}

export function CartProgressBar({cart, deliveryInfo}) {
  const progress = Number(cart?.cost?.subtotalAmount?.amount).toFixed(0) || 0;

  return progress < fieldDoctorSettings.cart.minimumOrder ? (
    <div className="card card-body border-gray-300 border">
      <div className="card-title text-lg font-light">
        our minimum order is £{fieldDoctorSettings.cart.minimumOrder.toFixed(2)}
      </div>
      <div className="join-item">
        <progress
          className="progress progress-accent h-4"
          value={progress}
          max="42.50"
        ></progress>
      </div>
    </div>
  ) : (
    <div className="card-actions">
      <Link
        to={cart?.checkoutUrl}
        className="btn btn-primary btn-block text-xl font-light"
      >
        checkout
      </Link>
    </div>
  );
}

function CartSummary({cart}) {
  const discountCost =
    Number(cart?.cost?.totalAmount?.amount) -
    Number(cart?.cost?.subtotalAmount?.amount);
  const discountAmount = {
    amount: String(discountCost),
    currencyCode: cart?.cost?.totalAmount?.currencyCode,
  };
  const shipping = 'free';

  return (
    <div className="card bg-white border border-gray-300">
      <div className="card-body">
        <div className="flex flex-col gap-1">
          {cart?.cost?.subtotalAmount?.amount && (
            <SummaryRow size={'sm'} label={'subtotal'}>
              <Money data={cart?.cost?.subtotalAmount}></Money>
            </SummaryRow>
          )}
          {discountCost < 0 && (
            <SummaryRow size={'sm'} label={'discount'}>
              <Money className=" text-red-600" data={discountAmount}></Money>
            </SummaryRow>
          )}
          {shipping && (
            <SummaryRow size={'sm'} label={'shipping'}>
              {shipping}
            </SummaryRow>
          )}
          {cart?.cost?.totalAmount?.amount && (
            <SummaryRow size={'lg'} label={'total'}>
              <Money data={cart?.cost?.totalAmount}></Money>
            </SummaryRow>
          )}
        </div>
      </div>
    </div>
  );
}

export function CartModals({cart, deliveryInfo}) {
  return (
    <Suspense>
      <Await resolve={deliveryInfo}>
        {(deliveryInfo) => {
          return (
            <Await resolve={cart}>
              {(cart) => {
                const [selectedDeliveryDate, setSelectedDeliveryDate] =
                  useState(
                    cart?.attributes.find(
                      (attribute) =>
                        attribute.key === 'preferred_delivery_date',
                    )?.value || deliveryInfo?.delivery_date,
                  );
                const [selectedFrequency, setSelectedFrequency] = useState(
                  cart?.attributes.find(
                    (attribute) => attribute.key === 'selected_selling_plan',
                  )?.value ||
                    fieldDoctorSettings?.sellingPlans[2].id.toString(),
                );
                /*const [attributesInput, setAttributesInput] = useState(
                  cart?.attributes || [
                    {
                      key: 'preferred_delivery_date',
                      value: selectedDeliveryDate,
                    },
                    {key: 'selected_selling_plan', value: selectedFrequency},
                  ],
                );*/

                const [newAttributesInput, setNewAttributesInput] = useState([
                  {
                    key: 'preferred_delivery_date',
                    value: selectedDeliveryDate,
                  },
                  {key: 'selected_selling_plan', value: selectedFrequency},
                ]);

                return (
                  <>
                    <CartAttributeChangeModal
                      availableValues={deliveryInfo?.delivery_dates}
                      newAttributesInput={newAttributesInput}
                      setNewAttributesInput={setNewAttributesInput}
                      attributeKey={'preferred_delivery_date'}
                      title="choose your delivery date"
                    >
                      <p>
                        your order will arrive between 7.30am and 7.30pm. we
                        will confirm your delivery slot the morning of your
                        delivery.
                      </p>
                    </CartAttributeChangeModal>
                    <CartAttributeChangeModal
                      availableValues={fieldDoctorSettings?.sellingPlans}
                      newAttributesInput={newAttributesInput}
                      setNewAttributesInput={setNewAttributesInput}
                      attributeKey={'selected_selling_plan'}
                      title="choose your subscription frequency"
                    ></CartAttributeChangeModal>
                  </>
                );
              }}
            </Await>
          );
        }}
      </Await>
    </Suspense>
  );
}
function ukDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function CartDeliverySettings({cart, deliveryInfo}) {
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryFrequency, setDeliveryFrequency] = useState(null);

  useEffect(() => {
    const preferredDeliveryDate = cart?.attributes?.find(
      (attribute) => attribute.key === 'preferred_delivery_date',
    )?.value;
    setDeliveryDate(preferredDeliveryDate || deliveryInfo?.delivery_date);
  }, [cart]);

  useEffect(() => {
    const preferredDeliveryFrequency = cart?.attributes?.find(
      (attribute) => attribute.key === 'selected_selling_plan',
    )?.value;
    setDeliveryFrequency(
      preferredDeliveryFrequency ||
        fieldDoctorSettings?.sellingPlans?.find(
          (plan) =>
            plan.id ===
            cart?.attributes?.find(
              (attribute) => attribute.key === 'selected_selling_plan',
            )?.value,
        )?.frequency?.title,
    );
  }, [cart]);

  return (
    <Suspense fallback={<p>loading...</p>}>
      <Await resolve={deliveryInfo}>
        {(deliveryInfo, cart) => {
          const deliveryDateTitle = deliveryFrequency != 1 ? 'first ' : '';
          return (
            <>
              <div className="indicator w-full">
                <span className="indicator-item indicator-top indicator-center badge badge-neutral">
                  {deliveryDateTitle}delivery date
                </span>
                <button
                  className="btn btn-secondary btn-outline w-full"
                  onClick={() =>
                    document
                      .getElementById('preferred_delivery_date')
                      .showModal()
                  }
                >
                  <span className="flex flex-row justify-center items-center gap-2">
                    <VanIcon size={'2em'} />
                    <span className="text-lg text-black font-light lowercase">
                      {deliveryDate ? (
                        ukDate(new Date(deliveryDate))
                      ) : (
                        <p>loading</p>
                      )}
                    </span>
                  </span>
                </button>
              </div>
              <div className="indicator w-full">
                <span className="indicator-item indicator-top indicator-center badge badge-neutral">
                  subscription frequency
                </span>
                <button
                  className="btn btn-secondary btn-outline w-full"
                  onClick={() =>
                    document.getElementById('selected_selling_plan').showModal()
                  }
                >
                  <span className="flex flex-row justify-center items-center gap-2">
                    <FrequencyIcon size={'2em'} />
                    <span className="text-lg  text-black font-light lowercase">
                      {
                        fieldDoctorSettings.sellingPlans.find(
                          (plan) => plan.id == deliveryFrequency,
                        )?.title
                      }
                    </span>
                  </span>
                </button>
              </div>
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}

export function CartAttributeChangeModal({
  attributeKey,
  availableValues,
  title,
  children,
  newAttributesInput,
  setNewAttributesInput,
}) {
  function handleAttributeChange(event) {
    const newAttributes = newAttributesInput?.filter(
      (attribute) => attribute.key !== attributeKey,
    );
    newAttributes.push({key: attributeKey, value: event.target.value});
    setNewAttributesInput(newAttributes);
  }

  useEffect(() => {
    console.log('submitting');
    document.getElementById('submit' + attributeKey).click();
    document.getElementById(attributeKey).close();
  }, [newAttributesInput]);

  return (
    <dialog id={attributeKey} className="modal">
      <div className="modal-box card-body">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <CloseIcon size={'2em'} />
          </button>
        </form>
        <h3 className="text-2xl">{title}</h3>
        {children}
        <div className="w-full">
          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.AttributesUpdateInput}
            inputs={{attributes: newAttributesInput}}
          >
            <select
              defaultValue={
                newAttributesInput?.find((attr) => attr.key == attributeKey)
                  ?.value || availableValues[0]
              }
              onChange={(event) => handleAttributeChange(event)}
              name={attributeKey}
              className="select select-bordered select-secondary w-full text-lg bg-white lowercase"
            >
              {availableValues?.map((value) => {
                //if the value is an object, use the id and title properties, else assume date
                const id = value?.id || value;
                const title = value?.title || ukDate(new Date(value));
                return (
                  <option className={'text-lg font-light'} key={id} value={id}>
                    {title}
                  </option>
                );
              })}
            </select>
            <button
              id={'submit' + attributeKey}
              type="submit"
              className="hidden"
            >
              submit
            </button>
          </CartForm>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button className="w-screen"></button>
      </form>
    </dialog>
  );
}

function SummaryRow({label, value, size, children}) {
  const sizeClass = 'text-' + size;
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
