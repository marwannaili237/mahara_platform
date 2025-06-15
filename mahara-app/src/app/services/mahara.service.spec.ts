import { TestBed } from '@angular/core/testing';
import { MaharaService, Service, User } from './mahara.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('MaharaService', () => {
  let service: MaharaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaharaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should initially have no current user', () => {
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should login user successfully', fakeAsync(() => {
      const email = 'test@example.com';
      const password = 'password123';
      let loggedInUser: User | undefined;

      service.login(email, password).subscribe(user => {
        loggedInUser = user;
      });

      tick(1000);

      expect(loggedInUser).toBeDefined();
      expect(loggedInUser!.email).toBe(email);
      expect(loggedInUser!.name).toBe('Ahmed Benali');
      expect(service.getCurrentUser()).toEqual(loggedInUser!);
      expect(service.isLoggedIn()).toBeTrue();
    }));

    it('should logout user successfully', fakeAsync(() => {
      // First login
      service.login('test@example.com', 'password123').subscribe();
      tick(1000);
      expect(service.isLoggedIn()).toBeTrue();

      // Then logout
      service.logout();
      expect(service.getCurrentUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
    }));

    it('should emit current user changes', fakeAsync(() => {
      let currentUser: User | null = null;
      service.currentUser$.subscribe(user => currentUser = user);

      // Initially null
      expect(currentUser).toBeNull();

      // Login
      service.login('test@example.com', 'password123').subscribe();
      tick(1000);
      expect(currentUser).not.toBeNull();
      expect(currentUser!.email).toBe('test@example.com');

      // Logout
      service.logout();
      expect(currentUser).toBeNull();
    }));
  });

  describe('Service Management', () => {
    it('should get all services', fakeAsync(() => {
      let services: Service[] = [];
      service.getServices().subscribe(result => services = result);
      
      tick(500);
      
      expect(services.length).toBe(3);
      expect(services[0].title).toBe('House Cleaning');
      expect(services[1].title).toBe('Plumbing Repair');
      expect(services[2].title).toBe('Math Tutoring');
    }));

    it('should get only active services', fakeAsync(() => {
      let services: Service[] = [];
      service.getActiveServices().subscribe(result => services = result);
      
      tick(500);
      
      expect(services.length).toBe(2);
      expect(services.every(s => s.isActive)).toBeTrue();
      expect(services.find(s => s.title === 'Math Tutoring')).toBeUndefined();
    }));

    it('should get service by id', fakeAsync(() => {
      let foundService: Service | undefined;
      service.getServiceById(1).subscribe(result => foundService = result);
      
      tick(300);
      
      expect(foundService).toBeDefined();
      expect(foundService!.title).toBe('House Cleaning');
      expect(foundService!.id).toBe(1);
    }));

    it('should return undefined for non-existent service id', fakeAsync(() => {
      let foundService: Service | undefined;
      service.getServiceById(999).subscribe(result => foundService = result);
      
      tick(300);
      
      expect(foundService).toBeUndefined();
    }));

    it('should search services by title', fakeAsync(() => {
      let services: Service[] = [];
      service.searchServices('cleaning').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('House Cleaning');
    }));

    it('should search services by description', fakeAsync(() => {
      let services: Service[] = [];
      service.searchServices('professional').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('House Cleaning');
    }));

    it('should search services by category', fakeAsync(() => {
      let services: Service[] = [];
      service.searchServices('maintenance').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('Plumbing Repair');
    }));

    it('should be case insensitive when searching', fakeAsync(() => {
      let services: Service[] = [];
      service.searchServices('CLEANING').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('House Cleaning');
    }));

    it('should return empty array for non-matching search', fakeAsync(() => {
      let services: Service[] = [];
      service.searchServices('nonexistent').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(0);
    }));

    it('should get services by category', fakeAsync(() => {
      let services: Service[] = [];
      service.getServicesByCategory('Education').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('Math Tutoring');
    }));

    it('should be case insensitive when filtering by category', fakeAsync(() => {
      let services: Service[] = [];
      service.getServicesByCategory('education').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('Math Tutoring');
    }));

    it('should get services by location', fakeAsync(() => {
      let services: Service[] = [];
      service.getServicesByLocation('Algiers').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('House Cleaning');
    }));

    it('should be case insensitive when filtering by location', fakeAsync(() => {
      let services: Service[] = [];
      service.getServicesByLocation('algiers').subscribe(result => services = result);
      
      tick(400);
      
      expect(services.length).toBe(1);
      expect(services[0].title).toBe('House Cleaning');
    }));
  });

  describe('Utility Methods', () => {
    it('should calculate average rating correctly', () => {
      const services: Service[] = [
        { id: 1, title: 'Service 1', description: '', category: '', price: 0, location: '', providerId: 1, rating: 4.0, isActive: true },
        { id: 2, title: 'Service 2', description: '', category: '', price: 0, location: '', providerId: 2, rating: 5.0, isActive: true },
        { id: 3, title: 'Service 3', description: '', category: '', price: 0, location: '', providerId: 3, rating: 3.0, isActive: true }
      ];

      const average = service.calculateAverageRating(services);
      expect(average).toBe(4.0);
    });

    it('should return 0 for empty services array', () => {
      const average = service.calculateAverageRating([]);
      expect(average).toBe(0);
    });

    it('should round average rating to one decimal place', () => {
      const services: Service[] = [
        { id: 1, title: 'Service 1', description: '', category: '', price: 0, location: '', providerId: 1, rating: 4.1, isActive: true },
        { id: 2, title: 'Service 2', description: '', category: '', price: 0, location: '', providerId: 2, rating: 4.2, isActive: true }
      ];

      const average = service.calculateAverageRating(services);
      expect(average).toBe(4.2);
    });

    it('should format price with default currency', () => {
      const formatted = service.formatPrice(100);
      expect(formatted).toBe('100 DZD');
    });

    it('should format price with custom currency', () => {
      const formatted = service.formatPrice(100, 'USD');
      expect(formatted).toBe('100 USD');
    });

    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(service.validateEmail(email)).toBeTrue();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(service.validateEmail(email)).toBeFalse();
      });
    });

    it('should validate correct Algerian phone numbers', () => {
      const validPhones = [
        '+213555123456',
        '0555123456',
        '+213 555 123 456',
        '0555-123-456'
      ];

      validPhones.forEach(phone => {
        expect(service.validatePhone(phone)).toBeTrue();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789',
        '+33123456789',
        '0123456789',
        '',
        'abc123456'
      ];

      invalidPhones.forEach(phone => {
        expect(service.validatePhone(phone)).toBeFalse();
      });
    });
  });
});