var util = require("util");


var Filter = function() { };

Filter.get = function(filter) {
	if(filter instanceof Filter)
		return filter;
	else if(Array.isArray(filter))
	{
		var filters = [ ];
		for(var i=0; i<filter.length; i++)
			filters.push(Filter.get(filter[i]));
		return new Filter.Or(filters);
	}
	else
		return new Filter.Equals(filter);
};

Filter.Equals = _valueFilter(function(val1, val2) {
	return val1 == val2;
});


Filter.LessThan = _valueFilter(function(val1, val2) {
	return val1 != null && val2 != null && val1 < val2;
});


Filter.LessThanOrEqual = _valueFilter(function(val1, val2) {
	return val1 != null && val2 != null && val1 <= val2;
});


Filter.GreaterThan = _valueFilter(function(val1, val2) {
	return val1 != null && val2 != null && val1 > val2;
});


Filter.GreaterThanOrEqual = _valueFilter(function(val1, val2) {
	return val1 != null && val2 != null && val1 >= val2;
});


Filter.Not = function(filter) {
	this.__filter = filter;
};

Filter.Not.prototype.check = function(checkValue) {
	return !this.__filter.check(checkValue);
};


Filter.Or = function(filter) {
	this.__filters = Array.isArray(filter) ? filter : arguments;
};

util.inherits(Filter.Or, Filter);

Filter.Or.prototype.check = function(checkValue) {
	for(var i=0; i<this.__filters.length; i++)
	{
		if(this.__filters[i].check(checkValue))
			return true;
	}
	return false;
};


Filter.And = function(filter) {
	this.__filters = Array.isArray(filter) ? filter : arguments;
};

util.inherits(Filter.And, Filter);

Filter.And.prototype.check = function(checkValue) {
	for(var i=0; i<this.__filters.length; i++)
	{
		if(!this.__filters[i].check(checkValue))
			return false;
	}
	return true;
};


function _normaliseFilterValue(value) {
	if(value instanceof Date)
		return value.getTime();
	else
		return value;
}

function _valueFilter(check) {
	var ret = function(value) {
		this.__value = _normaliseFilterValue(value);
	};

	util.inherits(ret, Filter);

	ret.prototype.check = function(checkValue) {
		return check(this.__value, _normaliseFilterValue(checkValue));
	};

	return ret;
}

function _inheritFilter(getFilter) {
	var ret = function(value) {
		this.__filter = getFilter(value);
	};

	util.inherits(ret, Filter);

	ret.prototype.check = function(checkValue) {
		return this.__filter.check(checkValue);
	};

	return ret;
}


module.exports = Filter;