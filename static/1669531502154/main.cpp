//main.cpp

#include <iostream>
#include "DayOfYear.h"
using namespace std;

int main() {
	DayOfYear today;

	today.setMonth(9);
	today.setDay(10);

	cout << today.getMonth() << "/" << today.getDay() << endl;

	return 0;
}