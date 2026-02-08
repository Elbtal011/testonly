import SQLiteDatabase from 'better-sqlite3';

export function initEmailTemplatesTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create email_templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_content TEXT NOT NULL,
      design_json TEXT,
      category TEXT,
      bank_name TEXT,
      template_type TEXT,
      version INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      deliverability_score INTEGER DEFAULT 0,
      last_tested TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add new columns to existing table if they don't exist
  const columns = [
    'design_json TEXT',
    'bank_name TEXT',
    'template_type TEXT',
    'version INTEGER DEFAULT 1',
    'is_active BOOLEAN DEFAULT 1',
    'deliverability_score INTEGER DEFAULT 0',
    'last_tested TIMESTAMP'
  ];
  
  columns.forEach(column => {
    try {
      db.exec(`ALTER TABLE email_templates ADD COLUMN ${column}`);
      console.log(`Added column: ${column}`);
    } catch (error) {
      // Column already exists, ignore error
    }
  });
  
  // Add some sample email templates if none exist
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM email_templates').get() as { count: number };
  
  if (templateCount.count === 0) {
    // First add the original sample templates
    console.log('Adding original sample templates...');
    const sampleTemplates = [
      {
        name: 'Willkommens-E-Mail',
        subject: 'Willkommen bei unserem Service',
        html_content: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #003366; color: white; padding: 10px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Willkommen!</h1>
              </div>
              <div class="content">
                <p>Sehr geehrte/r {{name}},</p>
                <p>Herzlich willkommen bei unserem Online-Banking-Service. Wir freuen uns, dass Sie sich für uns entschieden haben.</p>
                <p>Mit Ihrem neuen Konto können Sie:</p>
                <ul>
                  <li>Ihre Finanzen jederzeit und überall verwalten</li>
                  <li>Zahlungen schnell und sicher durchführen</li>
                  <li>Ihre Kontoauszüge online einsehen</li>
                </ul>
                <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                <p>Mit freundlichen Grüßen,<br>Ihr Bank-Team</p>
              </div>
              <div class="footer">
                <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        category: 'Onboarding'
      },
      {
        name: 'Kontakt-Nachverfolgung',
        subject: 'Ihr Interesse an unserem Angebot',
        html_content: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a5276; color: white; padding: 10px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 10px 20px; background-color: #1a5276; color: white; text-decoration: none; border-radius: 4px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Vielen Dank für Ihr Interesse</h1>
              </div>
              <div class="content">
                <p>Sehr geehrte/r {{name}},</p>
                <p>vielen Dank für Ihr Interesse an unserem {{product}}. Wir haben Ihre Anfrage erhalten und möchten Ihnen gerne weitere Informationen zukommen lassen.</p>
                <p>Unser Angebot bietet Ihnen:</p>
                <ul>
                  <li>Attraktive Konditionen und Zinssätze</li>
                  <li>Flexible Laufzeiten und Rückzahlungsoptionen</li>
                  <li>Persönliche Beratung durch unsere Experten</li>
                </ul>
                <p>Für eine individuelle Beratung können Sie gerne einen Termin vereinbaren:</p>
                <p style="text-align: center">
                  <a href="{{booking_link}}" class="button">Termin vereinbaren</a>
                </p>
                <p>Mit freundlichen Grüßen,<br>Ihr Beratungsteam</p>
              </div>
              <div class="footer">
                <p>Falls Sie keine weiteren Informationen wünschen, können Sie sich <a href="{{unsubscribe_link}}">hier abmelden</a>.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        category: 'Vertrieb'
      },
      {
        name: 'Newsletter Vorlage',
        subject: 'Monatlicher Newsletter',
        html_content: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2874a6; color: white; padding: 10px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .news-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
              .news-title { color: #2874a6; font-size: 18px; margin-bottom: 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Newsletter {{month}} {{year}}</h1>
              </div>
              <div class="content">
                <p>Sehr geehrte/r {{name}},</p>
                <p>hier ist unser aktueller Newsletter mit wichtigen Neuigkeiten und Angeboten:</p>
                
                <div class="news-item">
                  <div class="news-title">Neue Konditionen für Sparkonten</div>
                  <p>Ab dem 1. des Monats bieten wir verbesserte Zinssätze für unsere Sparkonten an. Erfahren Sie mehr in unserer Filiale oder online.</p>
                </div>
                
                <div class="news-item">
                  <div class="news-title">Erweiterte Banking-App</div>
                  <p>Unsere Banking-App wurde aktualisiert und bietet nun zusätzliche Funktionen wie Finanzanalysen und Budgetplanung.</p>
                </div>
                
                <div class="news-item">
                  <div class="news-title">Sicherheitstipps</div>
                  <p>Schützen Sie Ihre Daten und Ihr Konto mit unseren aktuellen Sicherheitsempfehlungen.</p>
                </div>
                
                <p>Wir freuen uns, Sie als Kunden zu haben!</p>
                <p>Mit freundlichen Grüßen,<br>Ihr Newsletter-Team</p>
              </div>
              <div class="footer">
                <p>Diese E-Mail wurde an {{email}} gesendet. <a href="{{unsubscribe_link}}">Newsletter abbestellen</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
        category: 'Marketing'
      }
    ];
    
    const insert = db.prepare(`
      INSERT INTO email_templates (name, subject, html_content, category, bank_name, template_type, version, is_active, deliverability_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleTemplates.forEach(template => {
      insert.run(template.name, template.subject, template.html_content, template.category, null, null, 1, 1, 0);
    });
    
    console.log('Added sample email templates');
    
    // Add security alert templates for all banks
    console.log('Adding bank-specific security alert templates...');
    
    const securityTemplates = [
      {
        name: 'Commerzbank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'commerzbank',
        category: 'Commerzbank',
        html_content: `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #002e3c 0%, #004d66 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .alert { background-color: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .button { display: inline-block; padding: 16px 32px; background: #002e3c; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 10px; }
        .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Sicherheitswarnung</h1>
        </div>
        <div class="content">
            <div class="alert">
                <h2>🔒 Verdächtige Aktivität entdeckt</h2>
                <p>Wir haben ungewöhnliche Aktivitäten in Ihrem Commerzbank-Konto festgestellt.</p>
            </div>
            <p>Sehr geehrte{{#if firstName}} {{firstName}}{{/if}},</p>
            <p>unser Sicherheitssystem hat verdächtige Aktivitäten in Ihrem Konto entdeckt.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Datum: {{currentDate}} um {{currentTime}}</li>
                <li>IP-Adresse: {{loginIp}}</li>
                <li>Gerät: {{loginDevice}}</li>
            </ul>
            <p style="text-align: center;">
                <a href="#secure" class="button">🔒 Konto sichern</a>
                <a href="#password" class="button">🔑 Passwort ändern</a>
            </p>
            <p><strong>Wichtig:</strong> Commerzbank fragt niemals per E-Mail nach Zugangsdaten!</p>
        </div>
        <div class="footer">
            <p><strong>Commerzbank AG</strong><br>Kundenservice: +49 69 136 20000</p>
            <p><a href="{{unsubscribeLink}}">Abmelden</a> | <a href="#">Datenschutz</a></p>
        </div>
    </div>
</body>
</html>`
      }
    ];
    
    securityTemplates.forEach(template => {
      insert.run(
        template.name,
        template.subject,
        template.html_content,
        template.category,
        template.bank_name,
        'security',
        1, // version
        1, // is_active
        85 // deliverability_score
      );
    });
    
    console.log(`Added ${securityTemplates.length} security alert templates`);
  }
  
  // Always check and add security templates if they don't exist (even if other templates exist)
  const securityTemplateCount = db.prepare(`
    SELECT COUNT(*) as count FROM email_templates 
    WHERE template_type = 'security'
  `).get() as { count: number };
  
  if (securityTemplateCount.count === 0) {
    console.log('Adding security alert templates for production...');
    
    const productionSecurityTemplates = [
      {
        name: 'Commerzbank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'commerzbank',
        category: 'Commerzbank'
      },
      {
        name: 'Santander - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'santander',
        category: 'Santander'
      },
      {
        name: 'Apobank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'apobank',
        category: 'Apobank'
      },
      {
        name: 'Sparkasse - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'sparkasse',
        category: 'Sparkasse'
      },
      {
        name: 'Postbank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'postbank',
        category: 'Postbank'
      },
      {
        name: 'DKB - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'dkb',
        category: 'DKB'
      },
      {
        name: 'Volksbank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'volksbank',
        category: 'Volksbank'
      },
      {
        name: 'Comdirect - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'comdirect',
        category: 'Comdirect'
      },
      {
        name: 'Consorsbank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'consorsbank',
        category: 'Consorsbank'
      },
      {
        name: 'ING DiBa - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'ingdiba',
        category: 'ING DiBa'
      },
      {
        name: 'Deutsche Bank - Sicherheitswarnung',
        subject: 'Sicherheitswarnung - Verdächtige Aktivität in Ihrem Konto',
        bank_name: 'deutsche_bank',
        category: 'Deutsche Bank'
      }
    ];
    
    // Simple professional template for all banks
    const baseSecurityTemplate = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background-color: #dc2626; color: #ffffff; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .alert { background-color: #fff5f5; border: 2px solid #ef4444; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .button { display: inline-block; padding: 16px 32px; background: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 10px; }
        .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; }
        .details { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .suspicious { color: #dc2626; font-weight: bold; }
        @media only screen and (max-width: 600px) {
            .header, .content, .footer { padding: 20px !important; }
            .button { display: block !important; width: 100% !important; margin: 10px 0 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sicherheitswarnung</h1>
            <p>{{bankName}} - Verdächtige Aktivität entdeckt</p>
        </div>
        <div class="content">
            <div class="alert">
                <h2>WICHTIGE SICHERHEITSBENACHRICHTIGUNG</h2>
                <p>Wir haben ungewöhnliche Aktivitäten in Ihrem {{bankName}}-Konto festgestellt.</p>
            </div>
            <p>Sehr geehrte{{#if firstName}} {{firstName}}{{/if}},</p>
            <p>unser Sicherheitssystem hat verdächtige Aktivitäten in Ihrem {{bankName}}-Konto entdeckt. 
            Zu Ihrer Sicherheit haben wir bestimmte Funktionen vorsorglich eingeschränkt.</p>
            
            <div class="details">
                <h3>Details der verdächtigen Aktivität</h3>
                <div class="detail-row">
                    <span>Datum und Zeit:</span>
                    <span class="suspicious">{{currentDate}} um {{currentTime}}</span>
                </div>
                <div class="detail-row">
                    <span>IP-Adresse:</span>
                    <span class="suspicious">{{loginIp}}</span>
                </div>
                <div class="detail-row">
                    <span>Gerät:</span>
                    <span>{{loginDevice}}</span>
                </div>
                <div class="detail-row">
                    <span>Risikostufe:</span>
                    <span class="suspicious">HOCH</span>
                </div>
            </div>
            
            <p><strong>Sofortige Maßnahmen erforderlich:</strong></p>
            <p style="text-align: center;">
                <a href="#secure" class="button">Konto sofort sichern</a>
                <a href="#password" class="button">Passwort ändern</a>
            </p>
            
            <p><strong>Wichtiger Hinweis:</strong> {{bankName}} fragt niemals per E-Mail nach Zugangsdaten, PIN oder TAN!</p>
            
            <p>Falls Sie diese Aktivitäten selbst durchgeführt haben, können Sie diese Nachricht ignorieren.</p>
            
            <p style="margin-top: 30px;">
                Mit freundlichen Grüßen<br>
                <strong>Ihr {{bankName}} Sicherheitsteam</strong>
            </p>
        </div>
        <div class="footer">
            <p><strong>{{bankName}} Kundenservice</strong><br>
            Telefon: {{bankSupportPhone}}<br>
            E-Mail: {{bankSupportEmail}}</p>
            <p><a href="{{unsubscribeLink}}">Abmelden</a> | <a href="{{privacyPolicyUrl}}">Datenschutz</a></p>
            <p style="font-size: 11px; margin-top: 10px;">
                Diese E-Mail wurde an {{email}} gesendet.<br>
                Referenz: SEC-{{currentDate}}-{{transactionId}}
            </p>
        </div>
    </div>
</body>
</html>`;
    
    const securityInsert = db.prepare(`
      INSERT INTO email_templates (name, subject, html_content, category, bank_name, template_type, version, is_active, deliverability_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    productionSecurityTemplates.forEach(template => {
      securityInsert.run(
        template.name,
        template.subject,
        baseSecurityTemplate,
        template.category,
        template.bank_name,
        'security',
        1, // version
        1, // is_active
        90 // deliverability_score
      );
    });
    
    console.log(`✅ Added ${productionSecurityTemplates.length} security alert templates for production`);
  } else {
    console.log(`Security templates already exist: ${securityTemplateCount.count} found`);
  }
}
