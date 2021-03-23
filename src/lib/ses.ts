import { SES } from 'aws-sdk';

const sesClient = new SES();

const Ses = {
  sendEmailTemplate: async (
    to: string,
    template: string,
    templateData: string,
    from: string = 'omicronswe@gmail.com'
  ): Promise<SES.SendTemplatedEmailResponse> => {
    const params: SES.SendTemplatedEmailRequest = {
      Destination: { ToAddresses: [to] },
      Template: template,
      Source: from,
      TemplateData: templateData,
    };

    return sesClient
      .sendTemplatedEmail(params)
      .promise()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw Error(`Error in SES sendEmail to "${to}": ` + err);
      });
  },
};

export default Ses;
