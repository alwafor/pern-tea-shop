import React, { useEffect, useState } from 'react'
import { ProductDTO } from '../../../../@types/DTO/productDTOs'
import useIsVerified from '../../utils/customHooks/useIsVerified'
import { BasketAPI } from '../../serverApi/basket/basketAPI'
import { useTypedSelector } from '../../utils/customHooks/useTypedSelector'
import { BasketProducts } from './basketProducts/BasketProducts'
import { NoProducts } from './NoProducts'
import { BasketHead } from './BasketHead'
import { BasketFooter } from './BasketFooter'

interface Props {
    closeFunc: Function,
}

export const Basket: React.FC<Props> = ({ closeFunc }) => {

    const isVerified = useIsVerified()
    const [products, setProducts] = useState<ProductDTO[]>([])
    const [purchasePrice, setPurchasePrice] = useState(-1)
    const reduxProducts = useTypedSelector(state => state.basket.products)

    const removeLocalProduct = (productId: number) => {
        setProducts(prev => prev.filter(product => product.id !== productId))
    }

    useEffect(() => {

        const fetchProductsFromServer = async () => {
            const fetchedProducts = await BasketAPI.getProductsFromUserBasket()
            setProducts(fetchedProducts)
            changePurchasePrice(fetchedProducts)
        }

        const fetchProductsFromClient = () => {
            setProducts(reduxProducts)
            changePurchasePrice(reduxProducts)
        }

        const changePurchasePrice = (products: ProductDTO[]) => {
            setPurchasePrice(products.reduce((acc, product) => {
                let availableCost = product.discountCost ?? product.cost
                return acc + availableCost
            }, 0))
        }

        //todo implement redux thunk logic
        if (isVerified === 'true')
            fetchProductsFromServer()
        else if (isVerified === 'false')
            fetchProductsFromClient()
    }, [isVerified, reduxProducts])

    if (isVerified === 'pending' || purchasePrice === -1) return null

    return (
        <div className={'basket_wrapper'} onClick={() => closeFunc()}>
            <div className={'basket'} onClick={(e) => e.stopPropagation()}>
                <BasketHead closeFunc={closeFunc} />

                {
                    products.length
                        ? <>
                            <BasketProducts
                                products={products}
                                isVerified={isVerified}
                                setPurchasePrice={setPurchasePrice}
                                removeLocalProduct={removeLocalProduct}
                            />
                            <BasketFooter closeFunc={closeFunc} purchasePrice={purchasePrice} />
                        </>
                        : <NoProducts />
                }
            </div>
        </div>
    )
}