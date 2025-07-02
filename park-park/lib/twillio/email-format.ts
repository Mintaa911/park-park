import { emailBody } from "@/types";
import { formatDate } from "../utils";


export const parkingCheckoutEmail = (checkoutInfo: emailBody) => {
  const start_time = formatDate(checkoutInfo.start_time);
  const end_time = formatDate(checkoutInfo.end_time);
    const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px;">
      <!-- Main Content -->
      <div style="background: white; border-radius: 8px; padding: 30px 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="margin-bottom: 10px;">
            <img src="https://ktpnijmonuepxyijvgfl.supabase.co/storage/v1/object/public/assets//parking.png" alt="ParkPark Logo" style="width: 100px; height: 100px; background: #f8f9fa; border-radius: 50%; padding: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          </div>
          <h1 style="color: #2d3748; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Park Park</h1>
          <p style="color: #718096; font-size: 16px; margin: 8px 0 0 0;">Your Parking Reservation</p>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id=${checkoutInfo.stripe_payment_id}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
            View Your Parking Pass
          </a>
        </div>

        <!-- Details Table -->
        <div style="background: #f7fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 18px; margin-bottom: 20px; color: #2d3748; font-weight: 600;">Reservation Details</h3>
          <table style="width: 100%; font-size: 15px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; font-weight: 600; color: #4a5568;">Parking Pass ID:</td>
              <td style="padding: 12px 0; text-align: right; color: #2d3748; font-family: 'Courier New', monospace;">${checkoutInfo.stripe_payment_id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; font-weight: 600; color: #4a5568;">Location:</td>
              <td style="padding: 12px 0; text-align: right; color: #2d3748;">${checkoutInfo.location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; font-weight: 600; color: #4a5568;">Enter After:</td>
              <td style="padding: 12px 0; text-align: right; color: #2d3748;">${start_time}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #4a5568;">Exit By:</td>
              <td style="padding: 12px 0; text-align: right; color: #2d3748;">${end_time}</td>
            </tr>
          </table>
        </div>

        <!-- Total Amount -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center; color: white;">
          <h3 style="font-size: 18px; margin-bottom: 12px; font-weight: 600; opacity: 0.9;">Paid Amount</h3>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: -1px;">$${checkoutInfo.amount_paid}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; color: white; opacity: 0.8; font-size: 14px;">
        <p style="margin: 0;">Thank you for choosing ParkPark!</p>
        <p style="margin: 8px 0 0 0;">If you have any questions, please contact our support team.</p>
      </div>
    </div>
    `;
    return emailHtml;
}