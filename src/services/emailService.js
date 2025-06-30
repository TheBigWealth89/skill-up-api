import nodemailer from "nodemailer";
import config from "../config/config.js";

class EmailService {
  constructor() {
    // Using Gmail directly like this is okay for small tests but has limitations.
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        admin: config.email.auth.admin,
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });

    console.log("📧 Email Service Initialized");
  }

  async sendMail(options) {
    const mailOptions = {
      from: `"Skillup Nigeria" <${config.email.from}>`, // Sender address
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      //   console.log("Message sent: %s", info.messageId);
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      throw new Error("Failed to send email.");
    }
  }

  async sendPasswordResetEmail(data) {
    const subject = "Your Password Reset Link";
    const html = `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width:600px;margin:0 auto;padding:24px;background:#fff;">
    <h2>Password Reset Request</h2>
    <p>Hello ${data.name},</p>
    <p>You've requested to reset your password. Click the button below to create a new password:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${
        data.url
      }" style="display:inline-block;padding:12px 28px;background:#3498db;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Reset Password</a>
    </div>
    <p style="font-size:13px;color:#666;">This link will expire in 10 minutes for security reasons.</p>
    <p style="font-size:13px;color:#666;">If you didn't request this password reset, please ignore this email or contact support if you're concerned.</p>
    <hr style="margin:32px 0;">
    <footer style="font-size:12px;color:#888;text-align:center;">
      &copy; ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.<br>
      <a href="https://skillupnigeria.com/privacy" style="color:#3498db;">Privacy Policy</a> |
      <a href="https://skillupnigeria.com/terms" style="color:#3498db;">Terms of Service</a>
    </footer>
  </div>
</body>
</html>`;

    await this.sendMail({
      to: data.email,
      subject,
      html,
    });
  }

  async sendSuccessPasswordResetEmail(data) {
    const subject = "Password reset successfully";
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width:600px;margin:0 auto;padding:24px;background:#fff;">
    <h2 style="color:#2c3e50;text-align:center;">Password Reset Confirmation</h2>
    <p>Hello ${data.name},</p>
    <p>Your Skill Up Nigeria account password has been successfully reset on ${new Date().toLocaleString()}.</p>
    <p>If you initiated this change, no further action is required. If you didn't request this password reset, please contact our support team immediately at <a href="mailto:support@skillupnigeria.com">support@skillupnigeria.com</a>.</p>
    <p>For your security, we recommend:</p>
    <ul>
      <li>Using a strong, unique password</li>
      <li>Updating your password regularly</li>
    </ul>
    <p>You can now login with your new password: <a href="https://localhost/5000/auth/login">https://localhost/5000/auth/login</a></p>
    <p>Stay secure,<br><strong>The Skill Up Nigeria Team</strong></p>
    <hr style="margin:32px 0;">
    <footer style="font-size:12px;color:#888;text-align:center;">
      &copy; ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.<br>
      <a href="https://skillupnigeria.com/privacy" style="color:#3498db;">Privacy Policy</a> |
      <a href="https://skillupnigeria.com/terms" style="color:#3498db;">Terms of Service</a>
    </footer>
  </div>
</body>
</html>
    `;

    await this.sendMail({
      to: data.email,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(data) {
    const subject = "Welcome to Skill Up Nigeria!";
    const html = `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width:600px;margin:0 auto;padding:24px;background:#fff;">
    <h2 style="color:#2c3e50;text-align:center;">Welcome to Skill Up Nigeria!</h2>
    <p>Hello ${data.name},</p>
    <p>We're thrilled to have you join our community of lifelong learners. At Skill Up Nigeria, we're committed to helping you gain the skills needed to excel in today's competitive world.</p>
    <ol style="margin:24px 0 24px 20px;">
      <li>Explore our <a href="https://skillupnigeria.com/courses" style="color:#3498db;">course catalog</a> to find your perfect learning path.</li>
      <li>Complete your profile for personalized recommendations.</li>
      <li>Join our <a href="https://community.skillupnigeria.com" style="color:#3498db;">learning community</a> to connect with peers.</li>
    </ol>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://skillupnigeria.com/get-started" style="display:inline-block;padding:12px 28px;background:#3498db;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Start Learning Now</a>
    </div>
    <p>If you have any questions, our support team is always ready to help at <a href="mailto:support@skillupnigeria.com" style="color:#3498db;">support@skillupnigeria.com</a></p>
    <p style="margin-top:30px;">Happy learning!<br><strong>The Skill Up Nigeria Team</strong></p>
    <hr style="margin:32px 0;">
    <footer style="font-size:12px;color:#888;text-align:center;">
      &copy; ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.<br>
      <a href="https://skillupnigeria.com/privacy" style="color:#3498db;">Privacy Policy</a> |
      <a href="https://skillupnigeria.com/terms" style="color:#3498db;">Terms of Service</a>
    </footer>
  </div>
</body>
</html>`;

    await this.sendMail({
      to: data.email,
      subject,
      html,
    });
  }

  /**
   * Sends an email to an admin when a new course is created.
   * @param {object} course - The course object that was created.
   * @param {object} instructor - The instructor user object.
   */
  async sendNewCourseForApprovalEmail(course, instructor) {
    const adminEmail = config.email.auth.admin;
    const subject = `New Course for Approval: ${course.title}`;
    const html = `
      <h1>New Course Submission</h1>
      <p>Hello Admin,</p>
      <p>A new course titled "<strong>${course.title}</strong>" has been submitted by instructor <strong>${instructor.firstName} ${instructor.lastName}</strong> and is awaiting your approval.</p>
      <p>Please log in to the admin dashboard to review it.</p>
      <br>
      <p>Thank you,</p>
      <p>Skillup Nigeria</p>
    `;

    await this.sendMail({
      to: adminEmail,
      subject,
      html,
    });
    console.log("Approval notification sent to admin.");
  }

  /**
   * Sends an email to an instructor when their course is approved.
   * @param {object} course - The course object that was approved.
   */
  async sendCourseApprovalEmail(course) {
    // We need to populate the instructor's email
    const populatedCourse = await course.populate(
      "createdBy",
      "firstName lastName email"
    );
    const instructor = populatedCourse.createdBy;

    if (!instructor || !instructor.email) {
      console.error(
        "Could not send approval email: Instructor email not found."
      );
      return;
    }

    const instructorEmail = instructor.email;

    const subject = `Congratulations! Your Course "${course.title}" has been Approved`;
    const html = `
      <h1>Course Approved!</h1>
      <p>Hello ${instructor.firstName},</p>
      <p>Great news! Your course, "<strong>${course.title}</strong>", has been reviewed and approved by an administrator.</p>
      <p>It is now live on the platform for learners to enroll in.</p>
      <br>
      <p>Congratulations!</p>
      <p>Skillup Nigeria</p>
    `;

    await this.sendMail({
      to: instructorEmail,
      subject,
      html,
    });
    console.log(`Approval email sent to instructor: ${instructorEmail}`);
  }
}

export default new EmailService();
