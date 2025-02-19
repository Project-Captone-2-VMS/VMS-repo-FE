// Thêm mảng months vào đầu file
import { faker } from '@faker-js/faker';
import { VIOLATION_TYPES, REWARD_TYPES } from '../../components/Analytics/constants';
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Danh sách họ và tên Việt Nam
  const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Dang', 'Bui', 'Do'];
  const lastNames = ['Trung', 'Hung', 'Huy', 'Hoang', 'Tuan', 'Anh', 'Duc', 'Minh', 'Long', 'Nam', 'Hai', 'Thang'];
  
  // Danh sách địa điểm ở miền Trung
  const locations = {
    'Da Nang': {
      districts: ['Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son', 'Lien Chieu', 'Cam Le', 'Hoa Vang'],
      streets: [
        'Bach Dang', '3 Thang 2', 'Le Duan', 'Nguyen Van Linh', 
        'Phan Chau Trinh', 'Hung Vuong', 'Tran Phu', 
        'Dien Bien Phu', 'Truong Chinh', 'Vo Nguyen Giap'
      ]
    },
    'Hue': {
      districts: ['Phu Vang', 'Huong Thuy', 'Phu Loc', 'Huong Tra', 'Phu Hoi', 'Vinh Ninh'],
      streets: [
        'Le Loi', 'Hung Vuong', 'Tran Hung Dao', 'Nguyen Hue',
        'Bach Dang', 'Doi Cung', 'Hoang Dieu',
        'Le Duan', 'Mai Thuc Loan', 'Tran Nguyen Han'
      ]
    },
    'Quang Nam': {
      districts: ['Hoi An', 'Tam Ky', 'Dien Ban', 'Dai Loc', 'Duy Xuyen', 'Nam Giang'],
      streets: [
        'Tran Hung Dao', 'Phan Chu Trinh', 'Nguyen Hue', 
        'Hai Ba Trung', 'Le Loi', 'Bach Dang',
        'Nguyen Thai Hoc', 'Tran Phu', 'Cua Dai'
      ]
    }
  };
  
  // Hàm tạo địa chỉ miền Trung
  const generateCentralVietnamAddress = () => {
    // Chọn ngẫu nhiên thành phố
    const cities = Object.keys(locations);
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    // Chọn ngẫu nhiên quận/huyện và đường của thành phố đó
    const cityData = locations[city];
    const district = cityData.districts[Math.floor(Math.random() * cityData.districts.length)];
    const street = cityData.streets[Math.floor(Math.random() * cityData.streets.length)];
    
    // Tạo số nhà ngẫu nhiên
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    
    return `${streetNumber} ${street} Street, ${district}, ${city}`;
  };
  
  // Hàm tạo tên tiếng Việt không dấu
  const generateVietnameseName = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${lastName} ${firstName}`;
  };
  
  // Các mô tả vi phạm bằng tiếng Anh
  const violationDescriptions = [
    "Failed to follow designated route",
    "Exceeded speed limit in residential area",
    "Missed scheduled pickup time",
    "Improper parking during delivery",
    "Failed to maintain vehicle cleanliness",
    "Incomplete delivery documentation",
    "Customer complaint about service",
    "Late arrival at destination",
    "Traffic violation reported",
    "Safety protocol breach"
  ];
  
  // Các mô tả phần thưởng bằng tiếng Anh
  const rewardDescriptions = [
    "Perfect attendance record this month",
    "Outstanding customer service feedback",
    "Zero accidents in delivery route",
    "Excellent time management",
    "High efficiency in deliveries",
    "Positive customer reviews",
    "Fuel efficiency achievement",
    "Safety milestone reached",
    "Quality service recognition",
    "Route optimization success"
  ];
  
  export const generateDriverData = (month, year) => {
    const numDrivers = Math.floor(Math.random() * 6) + 15; // 15-20 drivers
  
    const generatePerformanceData = () => {
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(year, months.indexOf(month), i + 1);
        return date.toISOString().split('T')[0];
      });
  
      return dates.map(date => ({
        date,
        attendance: 85 + Math.random() * 15,
        deliveryTime: 80 + Math.random() * 20,
        safetyScore: 88 + Math.random() * 12,
        customerRating: 85 + Math.random() * 15
      }));
    };
  
    const generateViolations = () => {
      return Array.from({ length: Math.floor(Math.random() * 50) }, () => {
        const driverName = generateVietnameseName();
        return {
          id: faker.string.uuid(),
          driverId: faker.string.uuid(),
          driverName,
          type: faker.helpers.arrayElement(Object.values(VIOLATION_TYPES)),
          severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
          date: faker.date.recent({ days: 30 }),
          location: generateCentralVietnamAddress(),
          description: faker.helpers.arrayElement(violationDescriptions),
          status: faker.helpers.arrayElement(['pending', 'reviewed', 'resolved']),
          evidence: faker.helpers.arrayElement(['camera', 'gps', 'report'])
        };
      });
    };
  
    const generateRewards = () => {
      return Array.from({ length: Math.floor(Math.random() * 30) }, () => {
        const driverName = generateVietnameseName();
        return {
          id: faker.string.uuid(),
          driverId: faker.string.uuid(),
          driverName,
          type: faker.helpers.arrayElement(Object.values(REWARD_TYPES)),
          date: faker.date.recent({ days: 30 }),
          description: faker.helpers.arrayElement(rewardDescriptions),
          points: Math.floor(Math.random() * 100),
          badge: faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'platinum'])
        };
      });
    };
  
    return {
      performance: generatePerformanceData(),
      violations: generateViolations(),
      rewards: generateRewards()
    };
  };