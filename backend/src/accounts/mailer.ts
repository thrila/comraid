/** Sends one-time passcodes. Plug in a real email provider by implementing this interface. */
export interface Mailer {
  sendOtp(to: string, code: string): Promise<void>;
}

/**
 * Development mailer: prints the code to the server console instead of emailing it.
 * Replace with a real provider (Resend, SES, Postmark, ...) before going live.
 */
export const consoleMailer: Mailer = {
  async sendOtp(to, code) {
    console.log(`[mailer] verification code for ${to}: ${code}`);
  },
};
