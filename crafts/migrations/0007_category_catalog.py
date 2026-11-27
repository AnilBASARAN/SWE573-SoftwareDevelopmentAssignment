from django.db import migrations, models
import django.db.models.deletion


def copy_categories(apps, schema_editor):
    Craft = apps.get_model('crafts', 'Craft')
    Category = apps.get_model('crafts', 'Category')
    db = schema_editor.connection.alias
    names = set(Craft.objects.using(db).values_list('category', flat=True))
    names.update(['Ceramics', 'Textiles', 'Woodwork', 'Hats', 'Jewelry', 'Other'])
    for name in names:
        Category.objects.using(db).get_or_create(name=name, defaults={'approved': True})


class Migration(migrations.Migration):
    dependencies = [('crafts', '0006_craft_process_volume')]
    operations = [
        migrations.CreateModel(name='Category', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(max_length=100, unique=True)),
            ('approved', models.BooleanField(default=False)),
        ]),
        migrations.RunPython(copy_categories, migrations.RunPython.noop),
        migrations.AlterField(model_name='craft', name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,
                related_name='crafts', to='crafts.category', to_field='name')),
    ]
