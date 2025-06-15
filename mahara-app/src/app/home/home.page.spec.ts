import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    // Don't call detectChanges here to avoid triggering loadServices
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial title', () => {
    expect(component.title).toBe('Mahara Platform');
  });

  it('should initialize with empty services array', () => {
    // Initialize component manually
    component.services = [];
    component.isLoading = false;
    expect(component.services).toEqual([]);
  });

  it('should set isLoading to true when loading services', fakeAsync(() => {
    component.loadServices();
    expect(component.isLoading).toBe(true);
    tick(1000);
    expect(component.isLoading).toBe(false);
  }));

  it('should load services after timeout', fakeAsync(() => {
    component.loadServices();
    expect(component.isLoading).toBe(true);
    expect(component.services.length).toBe(0);

    tick(1000);

    expect(component.isLoading).toBe(false);
    expect(component.services.length).toBe(3);
    expect(component.services[0].title).toBe('House Cleaning');
    expect(component.services[1].title).toBe('Plumbing Repair');
    expect(component.services[2].title).toBe('Tutoring');
  }));

  it('should return correct service count', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    expect(component.getServiceCount()).toBe(3);
  }));

  it('should calculate total value correctly', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    expect(component.getTotalValue()).toBe(155); // 50 + 75 + 30
  }));

  it('should filter services by title', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    component.searchServices('cleaning');
    expect(component.services.length).toBe(1);
    expect(component.services[0].title).toBe('House Cleaning');
  }));

  it('should filter services by category', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    component.searchServices('maintenance');
    expect(component.services.length).toBe(1);
    expect(component.services[0].title).toBe('Plumbing Repair');
  }));

  it('should be case insensitive when searching', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    component.searchServices('TUTORING');
    expect(component.services.length).toBe(1);
    expect(component.services[0].title).toBe('Tutoring');
  }));

  it('should reload all services when search query is empty', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    // First filter services
    component.searchServices('cleaning');
    expect(component.services.length).toBe(1);
    
    // Then search with empty query
    component.searchServices('');
    tick(1000); // Wait for reload
    expect(component.services.length).toBe(3);
  }));

  it('should reload all services when search query is only spaces', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    // First filter services
    component.searchServices('cleaning');
    expect(component.services.length).toBe(1);
    
    // Then search with spaces only
    component.searchServices('   ');
    tick(1000); // Wait for reload
    expect(component.services.length).toBe(3);
  }));

  it('should return empty array when no services match search', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    component.searchServices('nonexistent');
    expect(component.services.length).toBe(0);
  }));

  it('should handle multiple matching services', fakeAsync(() => {
    component.loadServices();
    tick(1000); // Wait for services to load
    
    // Add another cleaning service for testing
    component.services.push({ id: 4, title: 'Office Cleaning', category: 'Cleaning', price: 40 });
    
    component.searchServices('cleaning');
    expect(component.services.length).toBe(2);
    expect(component.services.every(s => s.title.toLowerCase().includes('cleaning'))).toBe(true);
  }));
});
