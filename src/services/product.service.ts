import { HttpException, Injectable } from '@nestjs/common'
import Type from '../entities/Type'
import Brand from '../entities/Brand'
import ProductInfo from '../entities/ProductInfo'
import Product from '../entities/Product'
import { GetAllProductsDTO, ProductDTO } from '../../@types/DTO/productDTOs'
import { TypeProperty } from '../entities/TypeProperty'
import { TypePropertyValue } from '../entities/TypePropertyValue'
import { CreateProductDTO } from '../dto/productDTOs'
import { Connection } from 'typeorm'

interface IGetProductOptions {
    addTypePropValues?: string
}

@Injectable()
export class ProductService {

    constructor(private readonly connection: Connection) {
    }

    async getProduct(idOrName: string, options: IGetProductOptions): Promise<ProductDTO> {
        let product: Product = await ProductService._getProduct(idOrName)
        const productDTOValues = ProductService._productToProductDTO(product)

        if(options.addTypePropValues === 'true') {
            productDTOValues.typePropertyValues = product.typePropertyValues
        }

        return productDTOValues
    }

    async getProductCount(idOrName: string): Promise<number> {
        let product: Product = await ProductService._getProduct(idOrName)
        return product.count
    }

    async getAllProducts(): Promise<GetAllProductsDTO[]> {
        const allProducts = await Product.find()
        return allProducts.map(ProductService._productToProductDTO)
    }

    async getProductsByType(typeId: number, pageNumber: number, filters: string[], pageSize: number = 50, order: 'ASC' | 'DESC' = 'ASC'): Promise<any> {
        if (Number.isNaN(pageNumber) || Number.isNaN(typeId))
            throw new HttpException(`Wrong typeId or pageNumber!`, 400)

        return await this.connection.manager.query(ProductService._queryFilteredProductsForCatPage(typeId, pageSize, (pageNumber - 1) * pageSize, filters, order))
    }

    async getAllProductsCountByType(typeId: number, filters: string[]): Promise<number> {
        return (await this.connection.manager.query(ProductService._queryCountOfProductsOnCatPage(typeId, filters)))[0].count
    }

    async createProduct(createProductDTO: CreateProductDTO) {

        //Check if product with given name exists
        const product = await Product.findOne({ where: { name: createProductDTO.name } })
        if (product) {
            throw new HttpException(`Product with name ${createProductDTO.name} already exists!`, 400)
        }

        //Check if brand exists
        const brand = await Brand.findOne({ where: { brand: createProductDTO.brand.toLowerCase() } })
        if (!brand) {
            throw new HttpException(`Brand ${createProductDTO.brand} not found!`, 400)
        }

        //Check if type exists
        const type = await Type.findOne({ where: { name: createProductDTO.type.toLowerCase() } })
        if (!type) {
            throw new HttpException(`Type ${createProductDTO.type} not found!`, 400)
        }

        //Check if typePropertyValues correct
        const typeProperties = type.typeProperties
        const typePropertyValues: TypePropertyValue[] = []

        for (let i = 0; i < createProductDTO.typeProperties.length; ++i) {
            let property = createProductDTO.typeProperties[i]

            //Check if typeProperty exists
            const prop = typeProperties.find(prop => prop.name === property.name.toLowerCase())
            if (!prop) {
                throw new HttpException(`There is no '${property.name}' type property on '${type.name}' type! Maybe you were looking for ${typeProperties.map(prop => '\'' + prop.name + '\'').slice(0, 6).join(',')}?`, 400)
            }

            const typeProperty = await TypeProperty.findOne(prop.id)

            //Check if typePropertyValue exists on typeProperty
            const typePropertyValue = typeProperty.typePropertyValues.find(typePropertyValue => typePropertyValue.name === property.value.toLowerCase())
            if (!typePropertyValue) {
                throw new HttpException(`There is no '${property.value}' property value on '${typeProperty.name}' typeProperty!`, 400)
            }

            typePropertyValues.push(typePropertyValue)
        }

        try {
            //Create product infos
            const productInfos = await Promise.all(createProductDTO.productInfos.map(info => ProductInfo.create({
                    name: info.name,
                    description: info.description
                }).save()
            ))

            return await Product.create({
                name: createProductDTO.name,
                cost: createProductDTO.cost,
                discountCost: createProductDTO.discountCost,
                img: createProductDTO.img,
                count: createProductDTO.count,
                brand,
                type,
                productInfos,
                typePropertyValues
            }).save()
        } catch (e) {
            throw new HttpException(e.message, 500)
        }
    }

    private static _productToProductDTO(product: Product): ProductDTO {
        return {
            count: product.count,
            img: product.img,
            cost: product.cost,
            discountCost: product.discountCost,
            name: product.name,
            id: product.id
        }
    }

    private static async _getProduct(value: string): Promise<Product> {
        let product: Product
        if (Number.isInteger(+value))
            product = await Product.findOne(+value)
        else
            product = await Product.findOne({ where: { name: value } })

        if (!product) throw new HttpException(`Can't find product with id or name \'${value}\'!`, 400)
        return product
    }

    private static _queryFilteredProductsForCatPage(typeId: number, take: number, skip: number, filters: string[], order: 'ASC' | 'DESC') {
        return `
            SELECT DISTINCT "id", "cost", "discountCost", "img", "name", "count" from 
            product LEFT JOIN product_type_property_values_type_property_value on product.id = "productId"
            WHERE "typeId" = ${typeId} ${filters && filters.length ? 'AND (' + filters.map(filter => `"typePropertyValueId" = ${filter}`).join(' OR ') + ')' : ''}
            ORDER BY "cost" ${order}
            LIMIT ${take} OFFSET ${skip} `
    }

    private static _queryCountOfProductsOnCatPage(typeId: number, filters: string[]) {
        return `
            SELECT COUNT(*) FROM
                (SELECT DISTINCT "id" from 
                product LEFT JOIN product_type_property_values_type_property_value on product.id = "productId"
                WHERE "typeId" = ${typeId} ${filters && filters.length ? 'AND (' + filters.map(filter => `"typePropertyValueId" = ${filter}`).join(' OR ') + ')' : ''
                }) d`
    }
}