package com.vaktim.ezan

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class VaktimWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        manager: AppWidgetManager,
        widgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences("vaktim_widget", Context.MODE_PRIVATE)
        val city = prefs.getString("city", "Konum bekleniyor") ?: "Konum bekleniyor"
        val prayer = prefs.getString("prayer", "Namaz vakitleri hazırlanıyor") ?: ""
        val time = prefs.getString("time", "--:--") ?: "--:--"

        for (id in widgetIds) {
            val views = RemoteViews(
                context.packageName,
                R.layout.vaktim_widget
            )

            views.setTextViewText(
                R.id.widget_city,
                city
            )
            views.setTextViewText(
                R.id.widget_prayer,
                prayer
            )

            views.setTextViewText(R.id.widget_countdown, time)
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(
                R.id.widget_title,
                pendingIntent
            )

            manager.updateAppWidget(id, views)
        }
    }
}
