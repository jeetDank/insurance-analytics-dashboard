import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';
import { LoaderService } from './loader.service';
import '../../contants/API_ENDPOINTS';
import { BASE_URL, API_ENDPOINTS } from '../../contants/API_ENDPOINTS';

interface company {
  cik: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class MainService {
  loaderSubject: Observable<any>;
  constructor(private http: HttpClient, private loader: LoaderService) {
    this.loaderSubject = this.loader.isLoading;
  }

  postCompanies(payload: { company_input: string }) {
    return this.http.post(`${BASE_URL}${API_ENDPOINTS.COMAPANIES}`, payload);
  }

  parseQuery(payload: { query: string }) {
    return this.http.post(`${BASE_URL}${API_ENDPOINTS.QUERY}`, payload);
  }

  startAnalysis(payload: {
    companies: company[];
    time_periods: string[];
    filing_type: string;
  }) {
    return this.http.post(`${BASE_URL}${API_ENDPOINTS.ANALYSE_BATCH}`, payload);
  }

  resolveAmbiguity(payload: {
    metric_name: string;
    context: string | null;
    suggestions: string[];
    resolution_type: string;
  }) {
    return this.http.post(`${BASE_URL}${API_ENDPOINTS.AMBIGUITY_RESOLVE}`, payload);
  }

  getAllFormulas(){
    return this.http.get(`${BASE_URL}${API_ENDPOINTS.GET_ALL_FORMULAS}`);
  }

  getFormulaByName(name:string){
    return this.http.get(`${BASE_URL}${API_ENDPOINTS.GET_FORMULA_BY_NAME}${name}`)
  }

}
