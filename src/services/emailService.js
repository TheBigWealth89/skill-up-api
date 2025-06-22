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
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });

    console.log("📧 Email Service Initialized");
  }

  async sendMail(options) {
    const mailOptions = {
      from: `"Skill up" <${config.email.from}>`, // Sender address
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
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            -webkit-font-smoothing: antialiased;
        }        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #ffffff;
        }
        .header {
            padding: 20px 0;
            border-bottom: 1px solid #e1e1e1;
            margin-bottom: 32px;
        }
        .content {
            padding: 0 15px;
            margin-bottom: 40px;
        }
        .btn {
            display: inline-block;
            padding: 14px 32px;
            background-color: #3498db;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            transition: background-color 0.2s;
            margin: 25px 0;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            padding-top: 32px;
            border-top: 1px solid #e1e1e1;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .warning {
            color: #666;
            font-size: 14px;
            font-style: italic;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
               
        <div class="header">
            <h1 style="color: #2c3e50; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div class="content">
            <p>Hello ${data.name},</p>
            <p style="margin: 20px 0;">You've requested to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${data.url}" class="btn">Reset Password</a>
            </div>
            
            <p class="warning">This link will expire in 10 minutes for security reasons.</p>
            <p class="warning">If you didn't request this password reset, please ignore this email or contact support if you're concerned.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="https://skillupnigeria.com/privacy" style="color: #3498db; text-decoration: none;">Privacy Policy</a> | 
                <a href="https://skillupnigeria.com/terms" style="color: #3498db; text-decoration: none;">Terms of Service</a>
            </p>
        </div>
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
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #7f8c8d; text-align: center; }
    </style>
</head>
<body>
       <div class="header">
        <h2>Password Reset Confirmation</h2>
    </div>
    
    <p>Hello ${data.name},</p>
    
    <p>Your Skill Up Nigeria account password has been successfully reset on ${new Date().toLocaleString()}.</p>
    
    <p>If you initiated this change, no further action is required. If you didn't request this password reset, please contact our support team immediately at <a href="mailto:support@skillupnigeria.com">support@skillupnigeria.com</a>.</p>
    
    <p>For your security, we recommend:</p>
    <ul>
        <li>Using a strong, unique password</li>
        <li>Updating your password regularly</li>
    </ul>
    
    <p>You can now login with your new password: <a href=">https://localhost/5000/auth/login">https://localhost/5000/auth/login</a></p>
    
    <p>Stay secure,<br>
    <strong>The Skill Up Nigeria Team</strong></p>
    
    <div class="footer">
        <p>© ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.</p>
        <p>
            <a href="https://skillupnigeria.com/privacy">Privacy Policy</a> | 
            <a href="https://skillupnigeria.com/terms">Terms of Service</a>
        </p>
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
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            -webkit-font-smoothing: antialiased;
        }        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #ffffff;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e1e1e1;
            margin-bottom: 32px;
        }
        .content {
            padding: 0 15px;
            margin-bottom: 40px;
        }
        .features {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 10px;
            background: #ffffff;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .feature-icon {
            width: 40px;
            height: 40px;
            margin-right: 15px;
            background: #e8f4fd;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3498db;
        }
        .btn {
            display: inline-block;
            padding: 14px 32px;
            background-color: #3498db;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            transition: background-color 0.2s;
            margin: 25px 0;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            padding-top: 32px;
            border-top: 1px solid #e1e1e1;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        @media only screen and (max-width: 480px) {
            .container { padding: 20px 10px; }
            .content { padding: 0 10px; }
            .features { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
       
        
        <div class="header">
            <h1 style="color: #2c3e50; margin: 0;">Welcome to Skill Up Nigeria!</h1>
            <p style="color: #666; margin-top: 10px;">Your journey to excellence starts here</p>
        </div>
        
        <div class="content">
            <p>Hello ${data.name},</p>
            <p style="margin: 20px 0;">We're thrilled to have you join our community of lifelong learners. At Skill Up Nigeria, we're committed to helping you gain the skills needed to excel in today's competitive world.</p>
            
            <div class="features">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Get Started with These Steps:</h2>
                <div class="feature-item">
                    <div class="feature-icon">📚</div>
                    <div>
                        <h3 style="color: #2c3e50; margin: 0;">Explore Courses</h3>
                        <p style="margin: 5px 0 0 0;">Browse our <a href="https://skillupnigeria.com/courses" style="color: #3498db; text-decoration: none;">course catalog</a> to find your perfect learning path</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">👤</div>
                    <div>
                        <h3 style="color: #2c3e50; margin: 0;">Complete Your Profile</h3>
                        <p style="margin: 5px 0 0 0;">Add your details to get personalized course recommendations</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🤝</div>
                    <div>
                        <h3 style="color: #2c3e50; margin: 0;">Join the Community</h3>
                        <p style="margin: 5px 0 0 0;">Connect with peers in our <a href="https://community.skillupnigeria.com" style="color: #3498db; text-decoration: none;">learning community</a></p>
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="https://skillupnigeria.com/get-started" class="btn">Start Learning Now</a>
            </div>

            <p style="margin: 20px 0;">If you have any questions, our support team is always ready to help at <a href="mailto:support@skillupnigeria.com" style="color: #3498db; text-decoration: none;">support@skillupnigeria.com</a></p>
            
            <p style="margin-top: 30px;">Happy learning!<br><strong>The Skill Up Nigeria Team</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Skill Up Nigeria. All rights reserved.</p>
            <p style="margin-top: 10px;">
                <a href="https://skillupnigeria.com/privacy" style="color: #3498db; text-decoration: none;">Privacy Policy</a> | 
                <a href="https://skillupnigeria.com/terms" style="color: #3498db; text-decoration: none;">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    await this.sendMail({
      to: data.email,
      subject,
      html,
    });
  }
}

export default new EmailService();
