export const sendEmail = async (
    to: string,
    subject: string,
    text: string
) => {
    console.log("📧 Sending email...");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", text);

    return true;
};