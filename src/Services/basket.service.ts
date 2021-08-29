import { HttpException, Injectable } from '@nestjs/common'
import User from '../Entities/User'
import Product from '../Entities/Product'
import Basket from '../Entities/Basket'
import { ProductDTO } from '../../@types/DTO/productDTOs'

@Injectable()
export class BasketService {
    async addProductToBasket(productId: string, userId: number): Promise<boolean> {
        const user = await User.findOne(userId)
        if (!user)
            throw new HttpException(`User with id ${userId} doesn't exist!`, 400)

        const product = await Product.findOne(productId)
        if (!product)
            throw new HttpException(`Product with id ${productId} doesn't exist!`, 400)

        const basket = await Basket.findOne(user.basket.id)
        if (!basket)
            throw new HttpException(`User with id ${user.id} doesn't have basket!`, 400)

        if (basket.products.find(prod => prod.id === product.id))
            return true

        basket.products.push(product)
        await Basket.save(basket)

        return true
    }

    async getProductsFromUserBasket(userId: number): Promise<ProductDTO[]> {
        const user = await User.findOne(userId)
        const basket = await Basket.findOne(user.basket.id)
        return basket.products.map(product => ({
            id: product.id,
            cost: product.cost,
            count: product.count,
            img: product.img,
            discountCost: product.discountCost,
            name: product.name
        }))
    }
}