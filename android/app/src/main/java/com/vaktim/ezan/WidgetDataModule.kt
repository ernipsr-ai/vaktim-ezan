package com.vaktim.ezan

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetDataModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetData"

    @ReactMethod
    fun updateWidget(city: String, prayer: String, time: String, schedule: String) {
        val prefs = reactContext.getSharedPreferences(
            "vaktim_widget", Context.MODE_PRIVATE
        )
        prefs.edit()
            .putString("city", city)
            .putString("prayer", prayer)
            .putString("time", time)
            .putString("schedule", schedule)
            .apply()

        val manager = AppWidgetManager.getInstance(reactContext)
        val component = ComponentName(reactContext, VaktimWidget::class.java)
        val ids = manager.getAppWidgetIds(component)
        if (ids.isNotEmpty()) {
            VaktimWidget().onUpdate(reactContext, manager, ids)
        }
    }
}
