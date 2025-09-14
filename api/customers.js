const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const customersFile = path.join(process.cwd(), 'data', 'customers.json');

  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(customersFile)) {
        return res.json([]);
      }

      const data = fs.readFileSync(customersFile, 'utf8');
      const customers = JSON.parse(data);
      
      customers.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
      res.json(customers);

    } catch (error) {
      console.error('Müşteri kayıtları getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Müşteri kayıtları getirilirken hata oluştu',
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    try {
      const customerData = {
        id: Date.now().toString(),
        ...req.body,
        registrationDate: new Date().toISOString()
      };

      // data klasörünü oluştur
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
      }

      let customers = [];
      if (fs.existsSync(customersFile)) {
        const data = fs.readFileSync(customersFile, 'utf8');
        customers = JSON.parse(data);
      }

      customers.push(customerData);
      fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));

      res.json({
        success: true,
        message: 'Müşteri kaydı başarıyla eklendi!',
        customerId: customerData.id
      });

    } catch (error) {
      console.error('Müşteri kayıt hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Müşteri kaydı sırasında hata oluştu',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
