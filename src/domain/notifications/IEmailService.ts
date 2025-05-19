
export interface IEmailService {
  sendShipmentCreationNotification(userEmail: string, trackingCode: string, recipientName: string): Promise<void>;
  sendShipmentAssignmentNotification(userEmail: string, trackingCode: string, origin: string, destination: string, estimatedTime: string): Promise<void>;
}
