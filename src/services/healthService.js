
export const getHealthInfo = (req, res) => {
        res.json({
                uptime: process.uptime(),
                message: 'Ok',
                date: new Date()
              }
        );    
}
