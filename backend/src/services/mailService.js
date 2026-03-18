const nodemailer = require("nodemailer");

const mailTransporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendReceiptEmail = async (recipientEmail, receiptData, userName) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    console.warn("Email credentials not configured. Skipping email send.");
    return false;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #2157d8; margin: 0 0 10px 0;">X-Change Exchange Receipt</h1>
        <p style="color: #666; margin: 0 0 20px 0;">Receipt #${receiptData.receiptNumber}</p>
        
        <div style="border-top: 2px solid #eee; border-bottom: 2px solid #eee; padding: 20px 0; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">You Sent:</span>
            <span style="font-weight: bold; color: #333;">${receiptData.sourceAmount} ${receiptData.fromCurrency}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">They Received:</span>
            <span style="font-weight: bold; color: #14b874;">${receiptData.convertedAmount} ${receiptData.toCurrency}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Exchange Rate:</span>
            <span style="font-weight: bold; color: #333;">1 ${receiptData.fromCurrency} = ${receiptData.rate} ${receiptData.toCurrency}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span style="color: #666;">Transfer Fee:</span>
            <span style="font-weight: bold; color: #14b874;">Free</span>
          </div>
        </div>

        <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 13px;">
            <strong>Exchange Date:</strong> ${receiptData.exchangeDate}<br>
            <strong>Account:</strong> ${userName}
          </p>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated receipt. For support, contact X-Change Financial Services.
        </p>
      </div>
    </div>
  `;

  try {
    await mailTransporter.sendMail({
      from: process.env.MAIL_USER,
      to: recipientEmail,
      subject: `Exchange Receipt #${receiptData.receiptNumber} - X-Change`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

module.exports = {
  sendReceiptEmail,
};
