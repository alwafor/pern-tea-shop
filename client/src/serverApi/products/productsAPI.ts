import axiosInstance from '../axiosInstance'
import { IGetProductOptions, ProductDTO } from '../../../../@types/DTO/productDTOs'

export class ProductsAPI {

    static async getProductById(productId: string, options: IGetProductOptions): Promise<ProductDTO> {
        return (await axiosInstance.get(`/product/${productId}`, {
            params: options
        })).data as ProductDTO
    }

    static async getCategoryProducts(
        typeId: number,
        pageNumber: number,
        filters: number[],
        pageSize: number | undefined = undefined,
        order: 'ASC' | 'DESC' | undefined = undefined
    ) {
        return (await axiosInstance.get(`/product/all/type/${typeId}/page/${pageNumber}`, {
            params: {
                pageSize,
                filters,
                order
            }
        })).data
    }

    static async getCategoryProductsCount(typeId: number, filters: number[]) {
        return (await axiosInstance.get(`/product/all/type/${typeId}/count`, {
            params: {
                filters
            }
        })).data
    }
}