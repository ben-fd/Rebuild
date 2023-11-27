import {useRouteLoaderData} from '@remix-run/react';
import {loadRouteModule} from '@remix-run/react/dist/routeModules';
import React, {useState, useEffect} from 'react';
import {loader as productLoader} from '../routes/products.$handle';
import {CloseIcon} from '../components/Icons';
import {Image, CartForm} from '@shopify/hydrogen';
import {ProductImage} from '../routes/products.$handle';

const ProductModal = ({product, quantity}) => {
  return (
    <dialog id="product_modal" className="modal" onClose={() => null}>
      <div className="modal-box card lg:card-side bg-base-100 shadow-xl grid grid-cols-2 max-w-4xl p-0">
        <figure className="w-105 col-span-1">
          <ProductImage
            image={product?.variants?.nodes[0]?.image}
            sizes={'20px 100px 400px'}
          />
        </figure>
        <div className="card-body max-w-lg col-span-1">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <CloseIcon size={'2em'} />
            </button>
          </form>
          <div className="grid grid-rows-2">
            <div className=" row-span-1">
              <h3 className="text-2xl">{product?.title}</h3>
              <div className="w-full"></div>
              <form method="dialog" className="modal-backdrop">
                <button className="w-screen"></button>
              </form>
              <div>
                {product ? (
                  <div>
                    <h2>{product?.title}</h2>
                    <p>{product?.description}</p>
                    <p>{product?.price}</p>
                    {/* Add more product details here */}
                  </div>
                ) : (
                  <div>
                    <h2>No product selected</h2>
                  </div>
                )}
              </div>
            </div>
            <div className=" row-span-1">
              <div className="flex justify-between">
                <div className="flex justify-between">
                  <button className="btn btn-ghost btn-sm rounded-btn flex items-center">
                    -
                  </button>
                  <p className="btn btn-ghost btn-sm rounded-btn">0</p>
                  <button className="btn btn-ghost btn-sm rounded-btn">
                    +
                  </button>
                </div>
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

export async function loadProductDataByFetch(handle) {
  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      // Filter out third party tracking params
      !option.name.startsWith('fbclid'),
  );

  const selectedProductHandle = handle;

  let product = null;
  if (selectedProductHandle) {
    product = await storefront.query(PRODUCT_QUERY, {
      variables: {handle: selectedProductHandle, selectedOptions},
    });
  }
  return data;
}

export default ProductModal;
