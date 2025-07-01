import { emailBody } from "@/types";


export const parkingCheckoutEmail = (checkoutInfo: emailBody) => {
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #eee; padding: 24px;">
      <h2 style="text-align:center; font-size: 20px; margin-bottom: 24px;">RESERVATION DETAILS</h2>
      <button style="background-color: #2196F3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-bottom: 24px;">
        <a href=${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id=${checkoutInfo.stripe_payment_id} style="color: white; text-decoration: none;">
          View your pass
        </a>
      </button>
      <table style="width: 100%; font-size: 15px; margin-bottom: 24px;">
        <tr>
          <td style="font-weight: bold;">PARKING PASS:</td>
          <td style="text-align: right;">${checkoutInfo.stripe_payment_id}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">LOCATION:</td>
          <td style="text-align: right;">${checkoutInfo.location}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ENTER AFTER:</td>
          <td style="text-align: right;">${checkoutInfo.start_time}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">EXIT BY:</td>
          <td style="text-align: right;">${checkoutInfo.end_time}</td>
        </tr>
      </table>
      <h3 style="font-size: 16px; margin-bottom: 8px;">PARKING TOTAL</h3>
      <div style="font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 16px;">$${checkoutInfo.amount_paid}</div>
    </div>
    `;
    return emailHtml;
}