import React from 'react'

interface IProps {
    backgroundUrl: string
    title: string
    description: string,
    onClick: Function,

    width?: number
    height?: number
    textColor?: string
}

export const Card: React.FC<IProps> = ({
                                           backgroundUrl,
                                           title,
                                           description,
                                           width,
                                           height,
                                           textColor,
                                           onClick

                                       }) => {
    return (
        <div className="ui_card_wrapper" style={{width, height}} onClick={() => onClick()}>
            <div className='ui_card' style={{ backgroundImage: `url(${backgroundUrl})`, color: textColor}}>
                <div className='title' style={{borderColor: textColor}}>{title}</div>
                <div className='description'>{description}</div>
            </div>
        </div>

    )
}