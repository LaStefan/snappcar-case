import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CarSearchComponent } from './car-search/car-search.component';
import { SearchControlsComponent } from './car-search/search-controls/search-controls.component';
import { SearchResultsComponent } from './car-search/search-results/search-results.component';

@NgModule({
  declarations: [AppComponent, CarSearchComponent, SearchControlsComponent, SearchResultsComponent],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
