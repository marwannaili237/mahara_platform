import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  providerId: number;
  rating: number;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'provider';
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaharaService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private mockServices: Service[] = [
    {
      id: 1,
      title: 'House Cleaning',
      description: 'Professional house cleaning service',
      category: 'Cleaning',
      price: 50,
      location: 'Algiers',
      providerId: 1,
      rating: 4.5,
      isActive: true
    },
    {
      id: 2,
      title: 'Plumbing Repair',
      description: 'Expert plumbing repair and maintenance',
      category: 'Maintenance',
      price: 75,
      location: 'Oran',
      providerId: 2,
      rating: 4.8,
      isActive: true
    },
    {
      id: 3,
      title: 'Math Tutoring',
      description: 'Private math tutoring for all levels',
      category: 'Education',
      price: 30,
      location: 'Constantine',
      providerId: 3,
      rating: 4.2,
      isActive: false
    }
  ];

  constructor() { }

  // Authentication methods
  login(email: string, password: string): Observable<User> {
    // Mock login - in real app this would call an API
    const mockUser: User = {
      id: 1,
      name: 'Ahmed Benali',
      email: email,
      phone: '+213555123456',
      type: 'customer',
      location: 'Algiers'
    };

    return of(mockUser).pipe(
      delay(1000),
      map(user => {
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Service methods
  getServices(): Observable<Service[]> {
    return of(this.mockServices).pipe(delay(500));
  }

  getActiveServices(): Observable<Service[]> {
    return of(this.mockServices.filter(service => service.isActive)).pipe(delay(500));
  }

  getServiceById(id: number): Observable<Service | undefined> {
    return of(this.mockServices.find(service => service.id === id)).pipe(delay(300));
  }

  searchServices(query: string): Observable<Service[]> {
    const filteredServices = this.mockServices.filter(service =>
      service.title.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase()) ||
      service.category.toLowerCase().includes(query.toLowerCase())
    );
    return of(filteredServices).pipe(delay(400));
  }

  getServicesByCategory(category: string): Observable<Service[]> {
    const filteredServices = this.mockServices.filter(service =>
      service.category.toLowerCase() === category.toLowerCase()
    );
    return of(filteredServices).pipe(delay(400));
  }

  getServicesByLocation(location: string): Observable<Service[]> {
    const filteredServices = this.mockServices.filter(service =>
      service.location.toLowerCase() === location.toLowerCase()
    );
    return of(filteredServices).pipe(delay(400));
  }

  // Utility methods
  calculateAverageRating(services: Service[]): number {
    if (services.length === 0) return 0;
    const totalRating = services.reduce((sum, service) => sum + service.rating, 0);
    return Math.round((totalRating / services.length) * 10) / 10;
  }

  formatPrice(price: number, currency: string = 'DZD'): string {
    return `${price} ${currency}`;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    // Algerian phone number validation
    const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }
}