import {useLoaderData, useNavigate, useRouteLoaderData} from '@remix-run/react';
import React from 'react';
import {CloseIcon} from '../components/Icons';
import {ProductImage} from '../routes/products.$handle';
import {PRODUCT_QUERY} from '../routes/products.$handle';
import {tagMappings, rangeSettings} from './Personalisation';
import {ProductAddButtons} from '~/routes/shop';

const newspaper = {
  hidden: {
    transform: 'scale(0) rotate(720deg)',
    opacity: 0,
    transition: {
      delay: 0.3,
    },
  },
  visible: {
    transform: ' scale(1) rotate(0deg)',
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    transform: 'scale(0) rotate(-720deg)',
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const ProductModal = ({product, quantity}) => {
  console.log('STRING', JSON.stringify(product, null, 2));
  const navigate = useNavigate();

  function handleModalClose() {
    // remove productModal from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('productModal');
    navigate(url.pathname + url.search, {preventScrollReset: true});
  }

  const hasVariantQuantity = product?.variants?.some(
    (variant) => variant.quantity > 0,
  );

  return (
    <dialog
      id="product_modal"
      className={product == null ? 'hidden' : 'modal'}
      onClose={handleModalClose}
    >
      <form method="dialog" className="modal-backdrop">
        <button className="w-screen"></button>
      </form>
      <div className="modal-box md:card-side bg-base-100 shadow-xl grid md:grid-cols-2 max-w-4xl p-0 md:h-[90%] md:max-h-[30em]">
        <figure className="col-span-1  max-h-full h-full bg-white">
          <ProductImage image={product?.featuredImage} sizes={'300px'} />
        </figure>
        <div className="card-body max-w-lg  max-h-lg  col-span-1 overflow-y-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-1 top-1">
              <CloseIcon size={'2em'} />
            </button>
          </form>
          <div className="grid ">
            <div className=" row-span-1">
              <div className="margin-auto">
                {product ? (
                  <div className="card card-compact gap-4">
                    <div className="w-full indicator card-body outline outline-2 outline-neutral bg-white rounded-box">
                      <TypeBadge productType={product?.productType} />
                      <div className="text-center lowercase">
                        <h2 className="text-2xl text-center lowercase">
                          {product?.title}
                        </h2>

                        <p className="text-sm">{product?.description}</p>
                      </div>
                    </div>
                    <div className="w-full indicator card-body outline outline-2 outline-neutral bg-white rounded-box">
                      <span
                        className={
                          (hasVariantQuantity
                            ? 'badge-accent '
                            : 'badge-neutral ') +
                          'indicator-item indicator-center badge '
                        }
                      >
                        {hasVariantQuantity ? 'in basket' : 'add to basket'}
                      </span>
                      <ProductAddButtons variants={product?.variants} />
                    </div>
                    <MapIcons
                      productTags={product?.tags}
                      productId={product.id}
                    />
                  </div>
                ) : (
                  <div>
                    <h2>404</h2>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button className="w-screen"></button>
      </form>
    </dialog>
  );
};

export async function loadProductDataByFetch(handle, storefront) {
  const selectedOptions = [];

  const selectedProductHandle = handle;

  let product = null;
  if (selectedProductHandle) {
    product = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: selectedProductHandle, selectedOptions},
    });
  }
  return product;
}

export function TypeBadge({productType}) {
  const colour =
    rangeSettings?.find((range) => range.title === productType)?.colour ||
    'grey';

  return (
    <span
      className={
        'indicator-item indicator-center badge badge-neutral ' + colour
      }
    >
      <span className="lowercase">{productType}</span>
    </span>
  );
}
export function MapIcons({productTags, productId}) {
  let tags = [];

  productTags.map((productTag) => {
    const newTag = tagMappings.find(
      (tagMappings) => tagMappings.tag === productTag,
    );
    newTag?.icon_summary ? tags.push(newTag) : null;
  });

  return (
    <div className="flex flex-wrap flex-row gap-4 p-4 justify-center">
      {tags.map((tag) => {
        return (
          <div
            key={productId + tag.title}
            className="flex flex-col align-middle items-center gap-2 justify-center"
          >
            <img
              src={tag?.image_url || ''}
              className="w-14 h-14"
              alt={tag.title}
            />
            <p className="text-xs lowercase">{tag?.alt}</p>
          </div>
        );
      })}
    </div>
  );
}

export default ProductModal;
