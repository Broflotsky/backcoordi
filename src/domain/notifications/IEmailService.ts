
export interface IEmailService {
  sendShipmentCreationNotification(userEmail: string, trackingCode: string, recipientName: string): Promise<void>;
}
