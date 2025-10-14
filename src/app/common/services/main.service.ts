import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { LoaderService } from './loader.service';
import '../../contants/API_ENDPOINTS';
import { BASE_URL, API_ENDPOINTS } from '../../contants/API_ENDPOINTS';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  loaderSubject: Observable<any>;
  constructor(private http: HttpClient, private loader: LoaderService) {
    this.loaderSubject = this.loader.isLoading;
  }

  getSlowData(): Observable<any> {
    return this.http.get('https://jsonplaceholder.typicode.com/posts/1').pipe(
      delay(10000) // Artificially delay response
    );
  }

  interactiveAIChats(payload: any) {
    let eg_payload = {
      query: 'Compare Progressive and Travelers revenue for Q3 2024',
      user: 'demo_user',
      llm_provider: 'grok',
      llm_model: 'grok-beta',
      tab_origin: 'ai_chat',
    };
    return this.http.post(`${BASE_URL}${API_ENDPOINTS.QUERY}`, payload);
  }

  // GET

  getProviders() {
    return this.http.get(`${BASE_URL}${API_ENDPOINTS.PROVIDERS}`);
  }

  getCompanies() {
    return this.http.get(`${BASE_URL}${API_ENDPOINTS}`);
  }
}
