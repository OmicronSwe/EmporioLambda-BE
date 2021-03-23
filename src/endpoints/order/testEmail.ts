import { response, notFound, badResponse, badRequest } from '../../lib/APIResponses';
import { APIGatewayProxyHandler } from 'aws-lambda';
import Ses from '../../lib/ses'

/**
 * @param  {} event: event passed when lambda is triggered
 */
export const index: APIGatewayProxyHandler = async (event) => {

    const params ={
      name: "gino",
      totalPrice: 20,
      products:[{image:"https://local-imagebucket.s3.eu-central-1.amazonaws.com/c0654e0a-db95-46ad-a6ed-4d811aa01802.png",quantity:2,price:10,name:"name product 1",description:"description product 1",id:"dummy_id_9",category:null}, {image:null,quantity:3,price:20,name:"name product 2",description:"description product 2",id:"dummy_id_20",category:null}]
    }
    
  await Ses.sendEmailTemplate("nicomanto49@gmail.com","orderTemplateEmail",JSON.stringify(params));
};